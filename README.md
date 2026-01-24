# Homelab Journal

A public blog documenting my homelab journey - tutorials, architecture overviews, and lessons learned.

## About

This is a [Hugo](https://gohugo.io/) static site using the [PaperMod](https://github.com/adityatelange/hugo-PaperMod) theme, deployed to GitHub Pages.

**Live site:** https://yourusername.github.io/homelab-journal/

## Content Structure

```
content/
├── wiki/          # Topic-based reference documentation
│   ├── virtualization/
│   ├── networking/
│   ├── automation/
│   └── monitoring/
├── tutorials/     # Step-by-step guides
├── posts/         # Chronological journey posts
├── series/        # Multi-part learning paths
└── about/         # About page
```

## Local Development

### Prerequisites

- [Hugo Extended](https://gohugo.io/installation/) (v0.145.0+)
- Git

### Clone with submodules

```bash
git clone --recurse-submodules https://github.com/yourusername/homelab-journal.git
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
