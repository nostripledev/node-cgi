# node-cgi

Node as CGI-module.  
```diff 
- Proof of Concept, do not use in production.
```


## Example

```php++
<?php++
    header('Content-Type', 'text/plain');
    $a="Hello!";
    echo($a);
?>
