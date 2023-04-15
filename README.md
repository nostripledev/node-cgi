# node-cgi

Node as CGI-module. Proof of concept, don't use in production.

## Example

```php
<?php++
    header('Content-Type', 'text/plain');
    write('Hello!');
?>
