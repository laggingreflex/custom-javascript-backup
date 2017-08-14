# custom-backup

## Prologue

My backup needs are such that I need to do very different things based on which dir is being backed up. (some of those needs may not even be considered as "backup" per se...)

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

