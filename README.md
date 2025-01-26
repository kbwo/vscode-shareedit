# ShareEdit

A VS Code extension that enables real-time cursor position synchronization between VS Code and Vim editors, making it easier to collaborate or switch between editors seamlessly.

## Features

- Real-time cursor position synchronization between VS Code and Vim
- Text selection synchronization
- Multi-session support for different projects
- Automatic reconnection handling
- Debounced cursor updates for better performance
- Support for both Windows and Unix-based systems

## Requirements

- Visual Studio Code
- Vim with [vim-shareedit](https://github.com/kbwo/vim-shareedit) plugin installed

## Installation

1. Install this extension from the VS Code marketplace
2. Install the vim-shareedit plugin in Vim ( see [vim-shareedit](https://github.com/kbwo/vim-shareedit) for instructions )
3. Install the vscode-shareedit extension in VSCode ( see [Marketplace](https://marketplace.visualstudio.com/items?itemName=kbwo.shareedit) )

## Usage

1. Start a ShareEdit session in Vim using the vim-shareedit plugin
2. In VS Code:
   - Open the command palette (Ctrl+Shift+P / Cmd+Shift+P)
   - Run the "Connect to vim-shareedit" command
   - Select the active session from the quick pick menu
3. Your cursor positions will now be synchronized between VS Code and Vim. Try moving the cursor in one editor and see it move in the other.

## Breaking changes

- From v0.0.8, you no longer need to manually enter ports. You can now select from a list of active ports and their associated directories. Please update vim-shareedit to the latest version to use this feature.

## Available Commands

- `Connect to vim-shareedit`: Connect to a ShareEdit session
- `Disconnect from vim-shareedit`: Disconnect from the current session

## Notes

- The extension automatically detects active ShareEdit sessions
- Sessions are stored in:
  - Windows: `%APPDATA%\shareedit\sessions.json`
  - Unix: `~/.config/shareedit/sessions.json`

## Troubleshooting

If you encounter connection issues:
1. Ensure the vim-shareedit plugin is properly installed and running
2. Check if the WebSocket server is running on the specified port
3. Try disconnecting and reconnecting to the session

## License

This extension is open-sourced under the MIT License - see the [LICENSE](LICENSE) file for details.
