<?php 
	$value = (string)$_POST['value'];
	$field = (string)$_POST['field'];

	if( $value == "Вася"){
		echo 0;
	}else{
		echo $field;
	}

?>

