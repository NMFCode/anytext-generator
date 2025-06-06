/******************************************************************************
 * Copyright 2022 TypeFox GmbH
 * This program and the accompanying materials are made available under the
 * terms of the MIT License, which is available in the project root.
 ******************************************************************************/

import * as path from 'node:path';
import * as url from 'node:url';
import { describe, test } from 'vitest';
import type * as Generator from 'yeoman-generator';
import { createHelpers } from 'yeoman-test';
import type { Answers, NMFGenerator, PostAnwers } from '../src/index.js';

const answersForCore: Answers & PostAnwers = {
    extensionName: 'hello-world',
    rawLanguageName: 'Hello World',
    fileExtensions: '.hello',
    repository: 'http://example',
    openWith: false
};

describe('yeoman', () => {
    const packageTestDir = url.fileURLToPath(new URL('.', import.meta.url));
    const moduleRoot = path.join(packageTestDir, '../app');

    const files = (targetRoot: string) => [
        targetRoot + '/.gitignore',
        targetRoot + '/README.md',
        targetRoot + '/backend/HelloWorld.anytext',
        targetRoot + '/backend/HelloWorldLspServer.csproj',
        targetRoot + '/backend/HelloWorldLspServer.sln',
        targetRoot + '/backend/Program.cs',
        targetRoot + '/.vscode/launch.json',
        targetRoot + '/vscode/src/extension.ts',
        targetRoot + '/vscode/.vscodeignore',
        targetRoot + '/vscode/esbuild.js',
        targetRoot + '/vscode/LICENSE.md',
        targetRoot + '/vscode/package.json',
        targetRoot + '/vscode/README.md',
        targetRoot + '/vscode/tsconfig.json'
    ];

    test('should produce files at the correct location', async () => {

        const context = createHelpers({}).run(path.join(moduleRoot));

        // generate in examples
        const targetRoot = path.resolve(packageTestDir, '../../../examples');
        const extensionName = answersForCore.extensionName;

        // remove examples/hello-world (if existing) now and finally (don't delete everything else in examples)
        context.targetDirectory = path.resolve(targetRoot, extensionName);
        context.cleanTestDirectory(true);

        await context
            .withOptions(<Generator.BaseOptions>{
                // we need to explicitly tell the generator it's destinationRoot
                destinationRoot: targetRoot
            })
            .onTargetDirectory(workingDir => {
                // just for double checking
                console.log(`Generating into directory: ${workingDir}`);
            })
            .withAnswers(answersForCore)
            .withArguments('skip-install')
            .then((result) => {
                const projectRoot = targetRoot + '/' + extensionName;

                result.assertFile(files(projectRoot));
            }).finally(() => {
                context.cleanTestDirectory(true);
            });
        context.cleanTestDirectory(true); // clean-up examples/hello-world
    }, 120_000);

    test('should produce files with correct content', async () => {

        const context = createHelpers({}).run<NMFGenerator>(path.join(moduleRoot));

        // generate in examples
        const targetRoot = path.resolve(packageTestDir, '../../../examples');
        const extensionName = 'hello-world';

        // remove examples/hello-world (if existing) now and finally (don't delete everything else in examples)
        context.targetDirectory = path.resolve(targetRoot, extensionName);
        context.cleanTestDirectory(true);

        await context
            .withOptions(<Generator.BaseOptions>{
                // we need to explicitly tell the generator it's destinationRoot
                destinationRoot: targetRoot
            })
            .onTargetDirectory(workingDir => {
                // just for double checking
                console.log(`Generating into directory: ${workingDir}`);
            })
            .withArguments('skip-install')
            .withAnswers( <Answers>{
                ...answersForCore,
                extensionName,
                includeCLI: true,
                includeTest: true
            }).then((result) => {
                const projectRoot = targetRoot + '/' + extensionName;
                result.assertJsonFileContent(projectRoot + '/vscode/package.json', PACKAGE_JSON_EXPECTATION);
            }).finally(() => {
                context.cleanTestDirectory(true);
            });
    }, 120_000);
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PACKAGE_JSON_EXPECTATION: Record<string, any> = {
    name: 'hello-world',
    'displayName': 'Hello World Extension for Visual Studio Code',
    'homepage': 'http://example',
    'bugs': {
        'url': 'http://example/issues'
    },
    'repository': {
        'type': 'git',
        'url': 'http://example.git'
    },
    'version': '0.0.1',
    'engines': {
        'vscode': '^1.67.0',
        'node': '>=16.0.0'
    },
    'activationEvents': [
        'onLanguage:hello-world'
    ],
    'main': './dist/extension',
    'contributes': {
        'languages': [
            {
                'id': 'hello-world',
                'extensions': [
                    '.hello'
                ]
            }
        ]
    },
    'scripts': {
        'compile': 'npm run check-types && node esbuild.js',
        'vscode:prepublish': 'npm run package',
        'package': 'dotnet build ../backend/HelloWorldLspServer.sln --configuration Release && npm run check-types && node esbuild.js --production',
        'generate-parser': 'anytextgen generate-parser ../backend/HelloWorld.anytext -n HelloWorldLspServer.HelloWorld',
        'generate-metamodel': 'anytextgen generate-code ../backend/HelloWorld.anytext ../backend/HelloWorld.Metamodel.cs -n HelloWorldLspServer --save-metamodel-xmi'
    },
    'dependencies': {
        'hello-world': 'file:',
    },
};
