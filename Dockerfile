FROM oven/bun:1.1.8-slim

ARG USERNAME="mk"
RUN useradd -m "$USERNAME"
WORKDIR /home/$USERNAME

COPY ./src ./src
COPY ./package.json ./
COPY ./bun.lockb ./
RUN chown "$USERNAME":"$USERNAME" ./

RUN bun install

USER $USERNAME
WORKDIR /home/$USERNAME/

ENTRYPOINT ["bun", "src/index.ts"]
