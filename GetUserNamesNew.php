<?php

  $data_dir = 'Users';
  $users = scandir($data_dir);
  $returnString = '';
  for ($i = 0; $i < count($users); $i++) {
      $splits = explode('.', $users[$i]);
      if($splits[0] != 'Reconciliation'){
        $returnString .= $splits[0].' ';
      }
  }
  echo $returnString;
?>
