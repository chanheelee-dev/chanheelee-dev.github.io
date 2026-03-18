FROM mcr.microsoft.com/devcontainers/ruby:3.3

# Install OS dependencies for Jekyll and utilities
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      build-essential \
      git \
      curl \
      gnupg \
      less \
      locales \
      procps \
      unzip \
      zlib1g-dev \
      libxml2-dev \
      libxslt1-dev \
      libffi-dev \
      nodejs \
      npm && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install bundler and Jekyll globally
RUN gem update --system && \
    gem install bundler jekyll

# Set default locale to avoid warnings
RUN locale-gen en_US.UTF-8
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

WORKDIR /workspace
