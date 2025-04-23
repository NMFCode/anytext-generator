/******************************************************************************
 * Copyright 2021 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import Generator from 'yeoman-generator';
import type { CopyOptions } from 'mem-fs-editor';
import _ from 'lodash';
import chalk from 'chalk';
import * as path from 'node:path';
import which from 'which';
import { EOL } from 'node:os';
import * as url from 'node:url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const TEMPLATE_VSCODE_DIR = '../templates/vscode';
const TEMPLATE_BACKEND_DIR = '../templates/backend';
const USER_DIR = '.';

const EXTENSION_NAME = /<%= extension-name %>/g;
const RAW_LANGUAGE_NAME = /<%= RawLanguageName %>/g;
const REPOSITORY = /<%= Repository %>/g;
const FILE_EXTENSION = /"?<%= file-extension %>"?/g;
const FILE_EXTENSION_GLOB = /<%= file-glob-extension %>/g;
const TSCONFIG_BASE_NAME = /<%= tsconfig %>/g;

const LANGUAGE_NAME = /<%= LanguageName %>/g;
const LANGUAGE_ID = /<%= language-id %>/g;
const LANGUAGE_PATH_ID = /language-id/g;
const LANGUAGE_PATH_NAME = /LanguageName/g;

const NEWLINES = /\r?\n/g;

export interface Answers {
    extensionName: string;
    rawLanguageName: string;
    fileExtensions: string;
    repository: string;
}

export interface PostAnwers {
    openWith: 'code' | false
}

function printLogo(log: (message: string) => void): void {
    log('This is the client code generator for NMF AnyText');
}

function description(...d: string[]): string {
    return chalk.reset(chalk.dim(d.join(' ') + '\n')) + chalk.green('?');
}

export class NMFGenerator extends Generator {
    private answers: Answers;

    constructor(args: string | string[], options: Record<string, unknown>) {
        super(args, options);
    }

    async prompting(): Promise<void> {
        printLogo(this.log);
        this.answers = await this.prompt<Answers>([
            {
                type: 'input',
                name: 'extensionName',
                prefix: description(
                    'Welcome to AnyText!',
                    'This tool generates a VS Code extension with a simple demo grammar to get started quickly.',
                    'The extension name is an identifier used in the extension marketplace or package registry.'
                ),
                message: 'Your extension name:',
                default: 'hello-world',
            },
            {
                type: 'input',
                name: 'rawLanguageName',
                prefix: description(
                    'The language name is used to identify your language in VS Code.',
                    'Please provide a name to be shown in the UI.',
                    'CamelCase and kebab-case variants will be created and used in different parts of the extension and language server.'
                ),
                message: 'Your language name:',
                default: 'Hello World',
                validate: (input: string): boolean | string =>
                    /^[a-zA-Z].*$/.test(input)
                        ? true
                        : 'The language name must start with a letter.',
            },
            {
                type: 'input',
                name: 'fileExtensions',
                prefix: description(
                    'Source files of your language are identified by their file name extension.',
                    'You can specify multiple file extensions separated by commas.'
                ),
                message: 'File extensions:',
                default: '.greet',
                validate: (input: string): boolean | string =>
                    /^\.?\w+(\s*,\s*\.?\w+)*$/.test(input)
                        ? true
                        : 'A file extension can start with . and must contain only letters and digits. Extensions must be separated by commas.',
            },
            {
                type: 'input',
                name: 'repository',
                prefix: description(
                    'When packing your extension, you will need to provide repository information.',
                    'You can of course change this information later in the package.json of your extension.'
                ),
                message: 'Link to your repository:',
                default: 'https://github.com/example/example',
            }
        ]);
    }

    writing(): void {
        const fileExtensions = Array.from(
            new Set(
                this.answers.fileExtensions
                    .split(',')
                    .map(ext => ext.replace(/\./g, '').trim()),
            )
        );
        this.answers.fileExtensions = `[${fileExtensions.map(ext => `".${ext}"`).join(', ')}]`;

        const fileExtensionGlob = fileExtensions.length > 1 ? `{${fileExtensions.join(',')}}` : fileExtensions[0];

        this.answers.rawLanguageName = this.answers.rawLanguageName.replace(
            /(?![\w| |\-|_])./g,
            ''
        );
        const languageName = _.upperFirst(
            _.camelCase(this.answers.rawLanguageName)
        );
        const languageId = _.kebabCase(this.answers.rawLanguageName);

        const referencedTsconfigBaseName = 'tsconfig.json';
        const templateCopyOptions: CopyOptions = {
            process: content => this._replaceTemplateWords(fileExtensionGlob, languageName, languageId, referencedTsconfigBaseName, content),
            processDestinationPath: path => this._replaceTemplateNames(languageId, languageName, path)
        };

        this.sourceRoot(path.join(__dirname, TEMPLATE_VSCODE_DIR));
        for (const path of ['.', '../.vscode/launch.json', '.vscodeignore']) {
            this.fs.copy(
                this.templatePath(path),
                this._extensionPath('vscode/' + path),
                templateCopyOptions
            );
        }

        this.fs.copy(
            this._extensionPath('vscode/package-template.json'),
            this._extensionPath('vscode/package.json'),
            templateCopyOptions
        );
        this.fs.delete(this._extensionPath('vscode/package-template.json'));

        this.sourceRoot(path.join(__dirname, TEMPLATE_BACKEND_DIR));
        for (const path of ['.']) {
            this.fs.copy(
                this.templatePath(path),
                this._extensionPath('backend/' + path),
                templateCopyOptions
            );
        }

        this.fs.copy(this.templatePath('../README.md'), this._extensionPath('README.md'));
        // .gitignore files don't get published to npm, so we need to copy it under a different name
        this.fs.copy(this.templatePath('../gitignore.txt'), this._extensionPath('.gitignore'));
    }

    async install(): Promise<void> {
        const extensionPath = this._extensionPath('vscode');

        const opts = { cwd: extensionPath };
        if(!this.args.includes('skip-install')) {
            this.spawnSync('npm', ['install'], opts);
            this.spawnSync('dotnet', ['tool', 'install', 'nmf-anytextgen', '--global'], opts);
            this.spawnSync('npm', ['run', 'compile'], opts);
            this.spawnSync('npm', ['run', 'generate-parser'], opts);
            this.spawnSync('npm', ['run', 'generate-metamodel'], opts);
        }
    }

    async end(): Promise<void> {
        const code = await which('code').catch(() => undefined);
        if (code) {
            const answer = await this.prompt<PostAnwers>({
                type: 'list',
                name: 'openWith',
                message: 'Do you want to open the new folder with Visual Studio Code?',
                choices: [
                    {
                        name: 'Open with `code`',
                        value: code

                    },
                    {
                        name: 'Skip',
                        value: false
                    }
                ]
            });
            if (answer?.openWith) {
                this.spawn(answer.openWith, [this._extensionPath()]);
            }
        }
    }

    _extensionPath(...path: string[]): string {
        return this.destinationPath(USER_DIR, this.answers.extensionName, ...path);
    }

    _replaceTemplateWords(fileExtensionGlob: string, languageName: string, languageId: string, tsconfigBaseName: string, content: string | Buffer): string {
        return content.toString()
            .replace(EXTENSION_NAME, this.answers.extensionName)
            .replace(RAW_LANGUAGE_NAME, this.answers.rawLanguageName)
            .replace(REPOSITORY, this.answers.repository)
            .replace(FILE_EXTENSION, this.answers.fileExtensions)
            .replace(FILE_EXTENSION_GLOB, fileExtensionGlob)
            .replace(LANGUAGE_NAME, languageName)
            .replace(LANGUAGE_ID, languageId)
            .replace(TSCONFIG_BASE_NAME, tsconfigBaseName)
            .replace(NEWLINES, EOL);
    }

    _replaceTemplateNames(languageId: string, languageName: string, path: string): string {
        return path.replace(LANGUAGE_PATH_ID, languageId).replace(LANGUAGE_PATH_NAME, languageName);
    }
}

export default NMFGenerator;
