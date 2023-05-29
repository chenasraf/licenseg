# licenseg

Generate license for your projects easily.

## How to use

No need to install. Just use `npx`!

```shell
npx licenseg --name "My Name" mit
```

Or install globally:

```shell
# with your favorite package manager
pnpm add -g licenceg
yarn global add licenceg
pnpm i -g licenceg

# then use
licenceg --name "My Name" mit
```

## Commands

See the commands at any time by using `npx licenceg -h`.

| Command           | Description                |
| ----------------- | -------------------------- |
| list \| ls        | Lists available licenses   |
| clear-cache \| cc | Clears the cache directory |
| preview \| p      | Preview a license          |

Options:

| Option        | Description              |
| ------------- | ------------------------ |
| --help\|-h    | Display help information |
| --name\|-n    | Your name                |
| --license\|-l | License to generate      |
