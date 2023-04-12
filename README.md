Project for migrating content from one space to another.

> You can run this project in two ways, either through a UI or through the terminal.

### Download & Install

```shell
git clone https://github.com/hurtigruten/contentful-migration.git
```

Navigate to the project directory and install node_modules:

```shell
npm i
```

---

### Set environment variables

Rename `.env.example` to `.env`

**Note:**

- With the UI you only need the `VITE_CONTENTFUL_MANAGEMENT_API_KEY` variable.
- If using the script you need to set all the variables.

---

### Run UI

Currently broken, will fix soon.

```shell
npm run dev
```

UI built with [Qwik](https://qwik.builder.io/) ⚡️

---

### CLI

- copy content model

```shell
npm run copy:model content_type='microcopy'
```

- copy content

```shell
npm run copy:content content_type='microcopy'
```

- view content model dependencies

Check if a content model has links to other content models:

```shell
npm run deps
```

View dependencies for a specific content model:

```shell
npm run deps content_type='microcopy'
```

---

### Important notes

> Copy content will **fail with unresolvedLinks** if you try copy content with references to other content types.

- i.e if you have a content model `linksSet` that has a reference (one-to-many for example) to another content model `link` you need to first copy over all the content for `link` before copying all the content for `linksSet`.

`npm run deps` to find the dependencies for a content model.

- you may need to install `ts-node` on your system to run the script files

- if your content model contains links to an asset - it's not supported yet

- You may see 404 errors in console when copying content, this is normal and expected. Since there doesn't seem to be a way to check if a link exists before trying to copy it.

### TODO

- Add support for copying assets
- Add support for copying content with links to assets
- Bypass 404 errors by first getting all the content_ids that already exist in target space for a content type
- Fix issue where after selecting a content type there is no visual indication that stuff is loading... some qwik thing i'm not understanding
