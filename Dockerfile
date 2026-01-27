FROM php:8.2-apache

# Install required extensions
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    && docker-php-ext-install zip \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && mkdir -p /var/www/html/notes /var/www/html/uploads \
    && chown -R www-data:www-data /var/www/html/notes /var/www/html/uploads \
    && chmod -R 775 /var/www/html/notes /var/www/html/uploads

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
