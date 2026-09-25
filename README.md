# Homelab Journal

A public blog documenting my homelab journey - tutorials, architecture overviews, and lessons learned.

## About

This is a [Hugo](https://gohugo.io/) static site using the [Blowfish](https://github.com/nunocoracao/blowfish) theme, deployed to GitHub Pages. The old PaperMod directory is not the configured theme; `config/_default/hugo.toml` selects Blowfish.

**Live site:** https://mareox.github.io/homelab-journal/

## Content Structure

| Section | Path | Use |
|---|---|---|
| Journal | `content/journal/` | Short chronological work log |
| Wiki | `content/wiki/{topic}/` | Evergreen reference |
| Tutorials | `content/tutorials/` | Step-by-step guides |
| Posts | `content/posts/{year}/` | Lessons and lab notes |
| Series | `content/series/` | Connected learning paths |

The wiki topics are security, networking, infrastructure, automation, observability and ai-tooling. Journal entries are brief; posts carry full context and lessons. Simple entries can be flat Markdown files; articles with images or diagrams use page bundles with `index.md` and co-located assets. Hugo archetypes in `archetypes/` cover journal, tutorial, lesson-learned, architecture and wiki content.

## Local Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) (v0.146.0+)
- Git

### Clone with submodules

```bash
git clone --recurse-submodules https://github.com/mareox/homelab-journal.git
cd homelab-journal
```

### Run locally

```bash
hugo server -D
```

Visit http://localhost:1313/homelab-journal/

### Create new content

```bash
# New tutorial
hugo new tutorials/my-tutorial.md

# New wiki page
hugo new wiki/virtualization/new-topic.md

# New blog post
hugo new posts/2025/my-post.md

# New lesson learned
hugo new posts/2025/lesson-learned-topic.md
```

### Build for production

```bash
hugo --minify
```

Output will be in the `public/` directory.

## Theme and rendering

`config/_default/` holds `hugo.toml` (site and outputs), `params.toml` (homepage, search and article behavior), `languages.en.toml` (author), `menus.en.toml` (navigation) and `markup.toml` (syntax highlighting). The custom `homelab` palette is in `assets/css/schemes/homelab.css`. Section `_index.md` files set per-section display through `cascade:`.

Blowfish detects co-located `thumbnail.png` through its thumbnail wildcard; do not add `featureimage:` to page bundles. `layouts/partials/extend-footer.html` provides click-to-expand SVG lightboxes; `{{< network-topology >}}` renders the interactive map. Search uses the site JSON output and Fuse.js. Reusable banners are in `static/images/banner-*.png`.

## Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the `main` branch via GitHub Actions.

## Content Guidelines

### Security

- **Never include real IP addresses** - Use placeholders like `<YOUR_IP>`
- **Never include credentials** - Use `<YOUR_PASSWORD>`, `<YOUR_API_KEY>`
- **Never include domain names** - Use `<YOUR_DOMAIN>` or `example.com`
- **Standard ports are fine** - 80, 443, 22, etc.

### Templates

Each content type has an archetype with the expected frontmatter structure. Use `hugo new` to create content from these templates.

### Taxonomies

Available taxonomies:
- `tags`: General categorization
- `topics`: Technology categories (proxmox, docker, networking, etc.)
- `difficulties`: beginner, intermediate, advanced

## License

Content: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
Code examples: [MIT](LICENSE)

## Contributing

Found an error? Suggestions? Feel free to open an issue or submit a PR.
