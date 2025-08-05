# autoVersioner

`autoVersioner` is a streamlined command-line tool for managing version numbers across projects and subprojects. It simplifies incrementing version numbers in `package.json` files and environment files, with automatic Git integration for version tracking.

## Features

- **Version Control**: Easily increment version numbers (major, minor, patch) across your project
- **Multi-Project Support**: Perfect for monorepos with configurable subprojects 
- **Flexible File Updates**: Update versions in JSON files and environment (.env) files
- **Git Integration**: Automatically commit and push changes with descriptive version messages
- **Interactive CLI**: User-friendly prompts for version type, project selection, and commit messages

## Installation

```sh
# Install globally
npm install -g autoversioner

# Or as a dev dependency
npm install autoversioner --save-dev
```

## Configuration

Create a `autoVersioner.conf.json` file in your project root:

### About the `$schema` Field

The `$schema` field at the top of the configuration file is optional but highly recommended. It provides a link to the JSON schema that describes the structure and allowed values for the configuration. When included, many editors (like VS Code) will use this schema to offer features such as:

- **Auto-completion**: Suggests valid fields and values as you type.
- **Validation**: Warns you about typos or invalid configuration options.
- **Documentation**: Shows inline descriptions for each field.

This helps prevent configuration errors and makes editing the config file easier and safer.

### Basic Configuration

```json
{
  "$schema": "https://raw.githubusercontent.com/AGL-Studio/autoVersioner/refs/heads/master/src/utils/config.schema.json",
  "changeEnv": false,
  "skipGitCheck": false
}
```

### Advanced Configuration

```json
{
  "$schema": "https://raw.githubusercontent.com/AGL-Studio/autoVersioner/refs/heads/master/src/utils/config.schema.json",
  "files": [
    {
      "path": "package.json",
      "type": "json",
      "field": "version"
    },
    {
      "path": ".env",
      "type": "env",
      "field": "VERSION"
    }
  ],
  "subprojects": [
    {
      "dir": "client",
      "files": [
        {
          "path": "package.json",
          "type": "json",
          "field": "version"
        },
        {
          "path": ".env",
          "type": "env",
          "field": "NEXT_PUBLIC_VERSION"
        }
      ]
    },
    {
      "dir": "server",
      "files": [
        {
          "path": "package.json",
          "type": "json",
          "field": "version"
        },
        {
          "path": ".env",
          "type": "env",
          "field": "API_VERSION"
        }
      ]
    }
  ],
  "skipGitCheck": false
}
```

### Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `files` | Array | Files to update in the root directory |
| `subprojects` | Array | List of subprojects with their own files |
| `changeEnv` | Boolean | Whether to update .env files |
| `skipGitCheck` | Boolean | Skip Git commit and push operations |

## Usage

```sh
autoVersioner [options]
```

### Options

- `--config`, `-c`: Specify custom configuration file path
- `--project`, `-p`: Specify which project(s) to update (use 'main' for root project)

### Examples

```sh
# Run with interactive prompts
autoVersioner

# Use custom configuration file
autoVersioner --config ./custom-config.json

# Update specific projects
autoVersioner --project client
autoVersioner -p client -p server
```

## Interactive Workflow

When you run the tool, you'll be prompted to:

1. **Select version change type**:
   ```
   ? What type of change? (Use arrow keys)
   ❯ major
     minor
     patch
   ```

2. **Choose projects to update** (if you have subprojects):
   ```
   ? Which projects to update? (Press <space> to select)
   ❯ ◉ main
     ◉ client
     ◉ server
   ```

3. **Enter commit message**:
   ```
   ? Enter the commit message: Updated version for new feature release
   ```

4. **Update .env file** (if not specified in config):
   ```
   ? Do you want to update the .env file? (Y/n)
   ```

The tool will then:
1. Update versions in all specified files
2. Commit and push changes with your message and version details
3. Display progress and results in the console

## How It Works

`autoVersioner` follows these steps:

1. Reads configuration from your config file
2. Determines which projects to update based on your selection
3. Calculates new version numbers based on semantic versioning rules
4. Updates all specified files with the new versions
5. Commits and pushes changes to Git with descriptive commit messages

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on GitHub.

## License

This project is licensed under the ISC License.
