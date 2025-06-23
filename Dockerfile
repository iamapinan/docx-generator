FROM oven/bun:1

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p templates output

# Expose port
EXPOSE 5555

# Set environment variable
ENV PORT=5555

# Start the application
CMD ["bun", "run", "server.js"]
