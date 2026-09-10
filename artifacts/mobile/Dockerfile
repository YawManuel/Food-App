# syntax=docker/dockerfile:1.7
#
# Container image for @workspace/mobile (ASAP — Ghanaian food delivery).
#
# The build context is the WORKSPACE ROOT, not this directory, because the
# mobile package resolves `@workspace/api-client-react` through pnpm's
# `workspace:*` protocol. Build it from the repo root:
#
#   docker build -f artifacts/mobile/Dockerfile -t asap-mobile .
#
# or just use `docker compose up --build` (compose.yaml sets this up).
#
# Targets:
#   runtime (default) — Expo web export served by a dependency-free Node server
#   dev               — Metro dev server for hot reload / Expo Go

ARG NODE_IMAGE=node:24-bookworm-slim
ARG PNPM_VERSION=11.22.0

# ---------------------------------------------------------------------------
# base — node + pnpm, shared by every build stage
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS base
ARG PNPM_VERSION
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    CI=1 \
    EXPO_NO_TELEMETRY=1 \
    NPM_CONFIG_UPDATE_NOTIFIER=false
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
WORKDIR /workspace

# ---------------------------------------------------------------------------
# deps — install only what @workspace/mobile needs, cached on manifests alone
#
# Copying just the package.json files (not the sources) means editing a screen
# doesn't invalidate the install layer.
# ---------------------------------------------------------------------------
FROM base AS deps

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY artifacts/api-server/package.json      artifacts/api-server/
COPY artifacts/mobile/package.json          artifacts/mobile/
COPY artifacts/mockup-sandbox/package.json  artifacts/mockup-sandbox/
COPY lib/api-client-react/package.json      lib/api-client-react/
COPY lib/api-spec/package.json              lib/api-spec/
COPY lib/api-zod/package.json               lib/api-zod/
COPY lib/db/package.json                    lib/db/
COPY scripts/package.json                   scripts/

# `@workspace/mobile...` = the mobile package plus its workspace dependencies.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter "@workspace/mobile..."

# ---------------------------------------------------------------------------
# builder — produce the static web bundle
# ---------------------------------------------------------------------------
FROM deps AS builder

COPY tsconfig.base.json tsconfig.json ./
COPY lib lib
COPY artifacts/mobile artifacts/mobile

WORKDIR /workspace/artifacts/mobile
# Called directly rather than via `pnpm exec`: pnpm 11 runs a deps-status check
# before exec'ing a binary, which shells out to a FULL workspace install and
# then fails on esbuild's unapproved build script. The filtered install above
# is all this stage needs.
RUN ./node_modules/.bin/expo export --platform web --output-dir dist

# ---------------------------------------------------------------------------
# runtime — static files + a ~150-line Node server, no node_modules
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS runtime

ENV NODE_ENV=production \
    PORT=8081 \
    HOST=0.0.0.0

WORKDIR /app
COPY --from=builder /workspace/artifacts/mobile/dist ./static
COPY artifacts/mobile/docker/static-server.js ./static-server.js

EXPOSE 8081
USER node

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||8081)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "static-server.js"]

# ---------------------------------------------------------------------------
# dev — Metro dev server with hot reload (compose bind-mounts the sources)
# ---------------------------------------------------------------------------
FROM deps AS dev

ENV NODE_ENV=development \
    PORT=8081

COPY tsconfig.base.json tsconfig.json ./
COPY lib lib
COPY artifacts/mobile artifacts/mobile

WORKDIR /workspace/artifacts/mobile
EXPOSE 8081
CMD ["./node_modules/.bin/expo", "start", "--web", "--port", "8081"]
