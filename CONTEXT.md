# Context Glossary

This glossary captures domain language for the AI information reader work in this repository. It is not an implementation spec.

## Source Registry

The curated definition of which information sources the reader follows and why they matter.

## Base Source Registry Config

The human-maintained source registry baseline. It is the trusted source definition that should be reviewed intentionally.

## Generated Source Registry Overlay

A constrained source registry change produced by the Web application. It can adjust allowed source metadata or source lifecycle intent, but it is not the trusted baseline.

## Effective Source Registry

The validated source registry produced by combining the base source registry config with generated source registry overlays.

## Feed Hub

The backend layer that fetches, normalizes, deduplicates, stores, and exposes feed items from registered sources.

## Reader App

The Web reading experience that consumes feed data, source state, saved views, bookmarks, and reading state from the Feed Hub.
