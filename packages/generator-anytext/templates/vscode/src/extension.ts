import * as vscode from 'vscode';
import type { Executable, LanguageClientOptions, Position, ServerOptions} from 'vscode-languageclient/node.js';
import { LanguageClient } from 'vscode-languageclient/node.js';
import * as path from 'node:path';
import * as os from 'os';

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext)
{
    const isWindows = os.platform() === 'win32';
    const serverModule = context.asAbsolutePath(path.join('srv', '<%= LanguageName %>LspServer'));

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

    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher('**/*.<%= file-glob-extension %>');
    context.subscriptions.push(fileSystemWatcher);

    const clientOptions: LanguageClientOptions =
    {
        // Register the server for plain text documents
        documentSelector: [
            { language: '<%= language-id %>' }
            // add more language ids if your server supports other languages
        ],
        synchronize: {
            fileEvents: fileSystemWatcher
        }
    };

    client = new LanguageClient('<%= LanguageName %>', serverOptions, clientOptions);

    client.registerProposedFeatures();

    client.onNotification('custom/showReferences', async (definitionPosition: Position) => {
        const uri = vscode.window.activeTextEditor?.document.uri;
        const vscodePosition = new vscode.Position(definitionPosition.line, definitionPosition.character);

        const references: vscode.Location[] = await vscode.commands.executeCommand(
            'vscode.executeReferenceProvider',
            uri,
            vscodePosition
        );

        if (references) {
            await vscode.commands.executeCommand('editor.action.showReferences', uri, vscodePosition, references);
        }
    });

    console.log('LSP for <%= RawLanguageName %> is now active!');
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
