# Contributing

Issues are welcome: bug reports, rough edges, and ideas.

Pull requests are welcome too, but this is a one-person project, so **PRs are reviewed slowly**. For anything bigger than a small fix, please open an issue first so we can agree on the approach before you spend time on it.

Notes:
- Run `npm install` then `npm run verify` (typecheck, tests, build) before sending a PR.
- Keep the widgets backend-agnostic: no hard-coded hosts, keys or vendor IDs. Anything environment-specific is a prop.
- Don't add large binaries (images, video, fonts). Fonts load from a CDN; screenshots in `docs/img` are small JPEGs.
- By contributing you agree your contribution is licensed under the MIT license.

Built by [Xallindrome](https://xallindrome.co), an automation consultancy.
