<?php
  $str_json = file_get_contents('php://input');
  ini_set('display_errors', 1);
  error_reporting(E_ALL);
  $json = json_decode($str_json, true);
  #echo $str_json;
  $user = $json["user"];
  $xml = $json["xml"];
  $filename = $json["filename"];
  $dom = new DOMDocument();
  $dom->preserveWhiteSpace = FALSE;
  $dom->loadXML($xml);
  if(!file_exists('Users/'.$user)) {
    mkdir($user, 0777);
  }
  //Save XML as a file
  $dom->save('Users/'.$user.'/'.$filename.'.xml');
?>
