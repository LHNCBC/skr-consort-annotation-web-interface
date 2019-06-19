<?php
  $str_json = file_get_contents('php://input');
  #ini_set('display_errors', 1);
  #error_reporting(E_ALL);
  $json = json_decode($str_json, true);
  $data_dir = 'Users';
  $user = $json["user"];
  $unannotated_dir = 'unannotated_xmls';
  $filename = $json["filename"];
  $xml = new DOMDocument();
  if(file_exists($data_dir.'/'.$user.'/'.$filename.'.xml')) {
    $xml->load($data_dir.'/'.$user.'/'.$filename.'.xml');
  }else {
    $xml->load($unannotated_dir.'/'.$user.'/'.$filename.'.xml');
  }
  $returnJson['data'] = $xml->saveXML();
  echo json_encode($returnJson);
?>
