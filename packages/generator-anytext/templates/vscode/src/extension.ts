import * as vscode from 'vscode';
import type { Executable, LanguageClientOptions, ServerOptions} from 'vscode-languageclient/node.js';
import { LanguageClient } from 'vscode-languageclient/node.js';
import * as path from 'node:path';
import * as os from 'os';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext)
{
    const isWindows = os.platform() === 'win32';
    const serverModule = context.asAbsolutePath(path.join('srv', '<%= LanguageName %>Server'));

    const executablePath = isWindows ? `${serverModule}.exe` : serverModule;

    const server: Executable =
    {
        command: executablePath,
        args: [],
        options: { shell: false, detached: false }
    };
    const serverDebug: Executable =
    {
        command: executablePath,
        args: ['debug'],
        options: { shell: false, detached: false }
    };

    const serverOptions: ServerOptions = {
        run: server,
        debug: serverDebug
    };

    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.<%= file-extension %>');
    context.subscriptions.push(fileSystemWatcher);

    const clientOptions: LanguageClientOptions =
    {
        // Register the server for plain text documents
        documentSelector: [
            {language: '<%= language-id %>'}
            // add more language ids if your server supports other languages
        ],
        synchronize: {
            fileEvents: fileSystemWatcher
        }
    };

    client = new LanguageClient('<%= LanguageName %>', serverOptions, clientOptions);

    client.registerProposedFeatures();

    console.log('LSP for <%= LanguageName %> is now active!');
    client.start();
}

export function deactivate(): Thenable<void> | undefined
{
    if (!client)
    {
        return undefined;
    }
    return client.stop();
}
