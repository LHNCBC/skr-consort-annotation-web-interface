<?php
  $str_json = file_get_contents('php://input');
  #ini_set('display_errors', 1);
  #error_reporting(E_ALL);
  $json = json_decode($str_json, true);
  $user = $json["user"];
  $unannotated_dir = 'unannotated_xmls/'.$user;
  $annotated_dir = 'Users/'.$user;
  $unannotated_files = scandir($unannotated_dir);
  $annotated_files = scandir($annotated_dir);
  $returnString = '';
  for ($i = 0; $i < count($unannotated_files); $i++) {
      $splits = explode('.', $unannotated_files[$i]);
      $returnString .= $splits[0].' ';
  }
  if(!empty($annotated_dir)){
    $returnString .= "\t";
    for ($i = 0; $i < count($annotated_files); $i++) {
      $splits = explode('.', $annotated_files[$i]);
      $returnString .= $splits[0].' ';
    }
  }
  echo $returnString;
?>
