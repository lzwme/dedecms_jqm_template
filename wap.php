<?php
/**
 * 支持数组转换的 gbk2utf8
 * @param [type] $varlist [description]
 */
function ConvertCharset_custom($varlist) {
	global $cfg_soft_lang;
	if(preg_match('#utf#i',$cfg_soft_lang)) return 0;
	$varlists = explode(',',$varlist);
	$numargs=count($varlists);
	for($i = 0; $i < $numargs; $i++)
	{
		if(isset($GLOBALS[$varlists[$i]]))
		{
			$GLOBALS[$varlists[$i]] = AutoCharset($GLOBALS[$varlists[$i]]);
		}
	} 
	return 1;
}

require_once (dirname(__FILE__) . "/include/common.inc.php");
header("Content-Type: text/html; charset=utf-8");

require_once(dirname(__FILE__)."/include/wap.inc.php");

//执行动作
if(empty($action) || ($action=='list' && !intval($typeid)) || ($action=='article' && !intval($id))){
	$action = 'index';
}
//模板类型
if(empty($tmpl)) {
	$tmpl = 'wap';
}
//模板目录
$cfg_templets_dir = $cfg_basedir.$cfg_templets_dir;

//频道 id 与名称对应
$channelArray = array(
	1 => 'article',
	2 => 'images',
	3 => 'soft',
	6 => 'shop',
	'-8' => 'infos'
);

$channellist = array();
$newartlist = array();
$channellistnext = array();
$mid = $mid || 1;

//顶级导航列表
$dsql->SetQuery("Select id,typename From `#@__arctype` where reid=0 And channeltype<3 And ishidden=0 And ispart<>2 order by sortrank");//limit 4
$dsql->Execute();
while($row=$dsql->GetObject())
{
	array_push($channellist, array(
		'typeid' => $row->id,
		'typename' => $row->typename
	));
	//$channellist .= "<li><a href='wap.php?action=list&amp;typeid={$row->id}' data-icon='grid'>{$row->typename}</a></li> ";
}

//当前时间
//$curtime = strftime("%Y-%m-%d %H:%M:%S",time());
//$cfg_webname = ConvertStr($cfg_webname);

//主页
/*------------
function __index();
------------*/
if($action=='index') {
	( isset($_GET[p]) && intval($_GET[p])>=0 && intval($_GET[p])<=2000 ) ? $p = intval($_GET[p]) : $p=1;
	( isset($_GET[pz]) && intval($_GET[pz])>=0  && intval($_GET[pz])<=50 ) ? $pz = intval($_GET[pz]) : $pz=10;

	//最新文章
	$dsql->SetQuery("Select id,typeid,title,pubdate,click,channel From `#@__archives` where channel<3 And arcrank = 0 order by id desc limit " . ($p-1)*$pz . ",{$pz}");
	$dsql->Execute();
	while($row=$dsql->GetObject())
	{
		array_push($newartlist, array(
			'action' => $channelArray[$row->channel], 
			'typeid' => $row->typeid, 
			'id' => $row->id, 
			'title' => $row->title, 
			'click' => $row->click,
			'pubdate' => $row->pubdate
		));
		//$newartlist .= "<li><a href='wap.php?action=" . $channelArray[$row->channel] . "&amp;typeid={$row->typeid}&amp;id={$row->id}'><h3>".ConvertStr($row->title)."</h3> <p class='ui-li-aside'>[".date("m-d",$row->pubdate)."]</p><span class='ui-li-count'>{$row->click}</span></a></li>";
	}

	include($cfg_templets_dir."/{$tmpl}/index.wml");
	$dsql->Close();
	echo $pageBody;
	exit();
}
/*------------
function __list();
------------*/
//列表
else if($action=='list') {
	$needCode = 'utf-8';
	//$typeid = preg_replace("[^0-9]", '', $typeid);
	//if(empty($typeid)) $typeid=1;

	//当前栏目下级分类
	//$typeid = preg_replace("[^0-9]", '', intval($_GET[typeid]));
	$dsql->SetQuery("Select id,typename,channeltype From `#@__arctype` where reid='{$typeid}' And channeltype<3 And ishidden=0 And ispart<>2 order by sortrank");
	$dsql->Execute();
	while($row=$dsql->GetObject())
	{
		array_push($channellistnext, array(
			'typeid' => $row->id,
			'typename' => $row->typename
		));
		//$channellistnext .= "<li><a href='wap.php?action=list&amp;typeid={$row->id}'>".ConvertStr($row->typename)."</a></li> ";
	}

	require_once(dirname(__FILE__)."/include/datalistcp.class.php");
	$row = $dsql->GetOne("Select typename,ishidden,channeltype From `#@__arctype` where id='$typeid' ");
	if($row['ishidden']==1) exit();
	$typename = ConvertStr($row['typename']);
	$channeltype = $channelArray[$row['channeltype']];

	//栏目内容(分页输出)
	$sids = GetSonIds($typeid,0,true);
	$varlist = "cfg_webname,typename,channeltype,channellist,channellistnext,cfg_templeturl";
	ConvertCharset_custom($varlist);
	$dlist = new DataListCP();
	$dlist->SetTemplet($cfg_templets_dir."/{$tmpl}/list.wml");
	$dlist->pageSize = 10;
	$dlist->SetParameter("action","list");
	$dlist->SetParameter("typeid",$typeid);
	$dlist->SetSource("Select id,title,pubdate,click From `#@__archives` where typeid in($sids) And arcrank=0 order by id desc");
	$dlist->Display();
	exit();
}
//文档
/*------------
function __article();
------------*/
else if($action=='article') {
	//浏览量+1
	$dsql->ExecuteNoneQuery("Update `#@__archives` set click=click+1 where id='$id'");

	//文档信息
	$query = "Select tp.typename,tp.reid,tp.ishidden,arc.typeid,arc.title,arc.arcrank,arc.pubdate,arc.writer,arc.click,addon.body From `#@__archives` arc 
	  left join `#@__arctype` tp on tp.id=arc.typeid
	  left join `#@__addonarticle` addon on addon.aid=arc.id
	  where arc.id='$id'";
	$row = $dsql->GetOne($query,MYSQL_ASSOC);
	foreach($row as $k=>$v) $$k = $v;
	//获取同分类前一条的id
	$query = "Select id FROM `#@__archives` where id<'$id' AND typeid='$typeid' order by id desc limit 1";
	$row = $dsql->GetOne($query,MYSQL_ASSOC);
	(!empty($row[id])) ? $prev_arc_id = $row[id] : $prev_arc_id = $id;
	//获取同分类后一条的id
	$query = "Select id FROM `#@__archives` where id>'$id' AND typeid='$typeid' order by id asc limit 1";
	$row = $dsql->GetOne($query,MYSQL_ASSOC);
	(!empty($row[id])) ? $next_arc_id = $row[id] : $next_arc_id = $id;

	//echo 'id:',$id,',typeid:',$typeid,',prev_arcid:',$prev_arc_id,'next_arcid:',$next_arc_id;die();
	
	unset($row);

	$pubdate = strftime("%y-%m-%d %H:%M:%S",$pubdate);
	if($arcrank!=0) exit();
	$title = ConvertStr($title);
	$body = html2wml($body);
	if($ishidden==1) exit();

	//当前栏目同级分类
	//$reid = $reid;
	//if($typeid){
		//获取当前栏目上级分类id
		//$dsql->SetQuery("Select reid From `#@__arctype` where id='{$typeid}' And channeltype<3 And ishidden=0 And ispart<>2 limit 1");
		//$dsql->Execute();
		//如果获取到了数据
		//if($row=$dsql->GetObject()){
			//$reid = $row->reid;
		if($reid){
			$dsql->SetQuery("Select id,typename From `#@__arctype` where reid='{$reid}' And channeltype<3 And ishidden=0 And ispart<>2 order by sortrank");
			$dsql->Execute();
			while($row=$dsql->GetObject())
			{
				array_push($channellistnext, array(
					'typeid' => $row->id,
					'typename' => $row->typename
				));
				//$channellistnext .= "<li><a href='wap.php?action=list&amp;typeid={$row->id}'>".ConvertStr($row->typename)."</a></li> ";
			}
		}
	//}

	//栏目内容(分页输出)
	include($cfg_templets_dir."/{$tmpl}/article.wml");
	$dsql->Close();
	echo $pageBody;
	exit();
}
//图片
/*------------
function __images();
------------*/
else if($action=='images') {
	//浏览量+1
	$dsql->ExecuteNoneQuery("Update `#@__archives` set click=click+1 where id='$id'");

	//文档信息
	$query = "Select tp.typename,tp.reid,tp.ishidden,arc.typeid,arc.title,arc.arcrank,arc.pubdate,arc.writer,arc.click,addon.body,addon.imgurls From `#@__archives` arc 
	  left join `#@__arctype` tp on tp.id=arc.typeid
	  left join `#@__addonimages` addon on addon.aid=arc.id
	  where arc.id='$id'";
	$row = $dsql->GetOne($query,MYSQL_ASSOC);
	foreach($row as $k=>$v) $$k = $v;
	//获取同分类前一条的id
	$query = "Select id FROM `#@__archives` where id<'$id' AND typeid='$typeid' order by id desc limit 1";
	$row = $dsql->GetOne($query,MYSQL_ASSOC);
	(!empty($row[id])) ? $prev_arc_id = $row[id] : $prev_arc_id = $id;
	//获取同分类后一条的id
	$query = "Select id FROM `#@__archives` where id>'$id' AND typeid='$typeid' order by id asc limit 1";
	$row = $dsql->GetOne($query,MYSQL_ASSOC);
	(!empty($row[id])) ? $next_arc_id = $row[id] : $next_arc_id = $id;

	//echo 'id:',$id,',typeid:',$typeid,',prev_arcid:',$prev_arc_id,'next_arcid:',$next_arc_id;die();
	
	unset($row);

	if($ishidden==1) exit();

	$pubdate = strftime("%y-%m-%d %H:%M:%S",$pubdate);
	if($arcrank!=0) exit();
	$title = ConvertStr($title);
	$body = html2wml($body);

	preg_match_all("/ddimg='(.*?)'/i", $imgurls, $images_array);


	$imgContent = '';
	foreach ($images_array[1] as $key => $value) {
		$imgContent .= '<img data-index="' . $key . '" src="' . $value . '" width="99%"><br>';
	}

	//当前栏目同级分类
	if($reid){
		$dsql->SetQuery("Select id,typename From `#@__arctype` where reid='{$reid}' And channeltype<3 And ishidden=0 And ispart<>2 order by sortrank");
		$dsql->Execute();
		while($row=$dsql->GetObject())
		{
			array_push($channellistnext, array(
				'typeid' => $row->id,
				'typename' => $row->typename
			));
			//$channellistnext .= "<li><a href='wap.php?action=list&amp;typeid={$row->id}'>".ConvertStr($row->typename)."</a></li> ";
		}
	}

	$mid = 2;
	//栏目内容(分页输出)
	include($cfg_templets_dir."/{$tmpl}/article.wml");
	$dsql->Close();
	echo $pageBody;
	exit();
}
//错误
/*------------
function __error();
------------*/
else
{
	ConvertCharset_custom($varlist);
	include($cfg_templets_dir."/{$tmpl}/error.wml");
	$dsql->Close();
	echo $pageBody;
	exit();
}
?>
