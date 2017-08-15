# custom-javascript-backup

Create custom backups using javascript

## Install

```sh
npm i -g custom-javascript-backup
```

## Usage

```sh
cjb <root> [...options]
```

## Configuration

The configuration file is read from the following locations:

* `'.cjb'` file/dir in your homedir (`'~'` on *nix, `'C:\Users\<you>'` on Windows)

* `'.cjb'` file/dir in any folder being backed up

The `'.cjb'` file can be in either of these formats:

* JSON(5)

  To configure options.

* Javascript (Node) CommonJS module

  To configure options as well as provide the custom `onFile()` backup function.

* YAML that outputs JSON

  To configure options (same as JSON). Must be able to be parsed as JSON object; if a string is parsed it's (tried to be) treated as the `.gitignore` (explained next)

* .gitignore

  Special case in which `'.cjb'` is treated as `'.gitignore'` to exclude files/folders in that dir.


  Files named `'.gitignore'` are also read separately if the option `{gitignore: (default) true}` is set.

  Note: If the `'.cjb'` file is read as `.gitignore` and there also exists a `'.gitignore'` in that folder, then the `'.cjb'` file takes precedence in being the `.gitignore` for that folder. This is only true if If the `'.cjb'` file is read as `.gitignore` (not any other formats described above).



## Recipes

### 1. [Win] Backup **everything** from `C:\` to `B:\`

Scenario: You have a USB Backup drive `B:\` and you want to dump everything from `C:\` (your main drive) onto it.

An overly simplistic use case to show the basic function. This backs up everything from `C:\` to `B:\` on a Windows machine. It also preserves paths: `C:\some\dir\file.txt` will be copied to `B:\some\dir\file.txt`

Put this in your `'C:\Users\<you>\.cjb'`:

```js
exports.onFile = async (source, config) => {
  const dest = source.replace(/^C/, 'B');
  await fs.copy(source, dest);
}
```

Then run:

```sh
cjb C:\
```

Note:

* [fs-extra](https://github.com/jprichardson/node-fs-extra) module is available as a global `fs` object. It's a great improvement over native `fs` and provides handy functions such as `copy` which also automatically creates parent dirs as needed.

### 2. Same as (1) but a different behavior for `C:\Videos`

Scenario: You have a `C:\Videos` folder wherein lies all your videos, TV Shows, Movies, youtube downloaded videos, etc.

In addition to copying `C:\Videos\**` to `B:\Videos\` we want to free up some space on `C:\` by removing the filed that were "backed up" <small>(not technically a backup)</small> and instead replacing them with symlinks to the backed up source. Also do not backup any pre-existing symlinks.

This way we can still access the original content from its original location (C:\Videos\**) as long as or whenever the backup drive is connected.


Put this in your `'C:\Videos\.cjb'`:

```js
exports.onFile = async (source, config) => {
  const dest = source.replace(/^C/, 'B');
  const lstat = await fs.lstat(source);
  if (lstat.isSymbolicLink()) {
    // do nothing
  } else {
    await fs.copy(source, dest);
    await fs.remove(source);
    await fs.link(dest, source);
  }
}
```


## Inspiration

<details>

<summary>
tl;dr: Needed a programmatic "backup" solution that could accommodate various different use-cases rather than just a simple backup.
</summary>

---

My backup needs were such that I needed to do very different things based on which dir is being backed up. (some of those needs may not even be considered as "backup" per se...)

For example:

(backup dir is B:\)

* `C:\Work` - Backup to `B:\Work` but skip certain folders such as `node_modules`

* `C:\Work\.old` - if such a folder exists then move it to `B:\Work\.old` and delete `C:\Work\.old`. And also compress it on `B:\` (either using NTFS compression or just zip/7g). I know this isn't exactly "backup" (only one copy exists, i.e. on `B:\`).

* `C:\Users\<me>\AppData` - backup only selected following dirs:

 * `C:\Users\<me>\AppData\Mozilla` - backup everything except `...\Mozilla\cache`

 * ... same for `...\Chrome`

 * ... same for `...\OneNote` except the folder to ignore in this case is `backup`

* `C:\Videos` - I need this to be backed up with exact structure to `B:\videos` but I also want symlinks "backlinks" such that

 `C:\Videos\some-movie.mp4` `==>` (sym-links to) `B:\Videos\some-movie.mp4` (the "backup" copy)

 This is mainly to keep my `C:\` drive (which is a small SSD) "light" (by moving files out to `B:\`) but still have it behave as though the file were on `C:\` (hence the symlinks).

 I will also add new content to `C:\Videos` and I want, when I run the software/script again, that it does the same thing - "backup"s the actual files (while skipping the previously created symlinks) and creates new symlinks.

</details>
