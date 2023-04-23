# node-cgi

Node as CGI-module.  
```diff 
- Proof of Concept, do not use in production.
```


## Example

```php++
<?php++
    header('Content-Type', 'text/plain');
    $a = 10;
    $b = 5;
    $c = $a + $b;
    $d = $a * $b;
    echo "La somme de $a et $b est $c\n";
    echo "Le produit de $a et $b est $d\n";
?>
