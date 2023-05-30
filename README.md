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
pnpm add -g licenseg
yarn global add licenseg
pnpm i -g licenseg

# then use
licenseg --name "My Name" mit
```

## Commands

See the commands at any time by using `npx licenseg -h`.

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
