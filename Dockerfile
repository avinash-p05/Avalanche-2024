FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads


# Expose the port the app runs on
EXPOSE 5000

# Define environment variable for production
ENV NODE_ENV=production


# Start the application
CMD ["node", "index.js"]