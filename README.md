# node-cgi

Node as CGI-module.  
```diff 
- Proof of Concept, do not use in production.
```


## Example

```php++
<?php++
  $name = "Alice";
  $age = 27;
  echo("Hello, my name is $name and I am $age years old.");
?>
<br>

<?php++
  $numbers = [1, 2, 3, 4, 5];
  foreach ($numbers as $num) {
    echo("$num ");
  }
?>
<br>

<?if ($age >= 18) {?>
  <p>You are an adult</p>
<?} else {?>
  <p>You are a minor</p>
<?}?>

<?php++
  $x = 10;
  $y = 5;
  $sum = $x + $y;
  $product = $x * $y;
  echo("The sum of $x and $y is $sum");
  echo("The product of $x and $y is $product");
?>

