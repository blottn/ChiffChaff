# ChiffChaff

## Input format
```
{
	name : <string>,
	type : <string>,
	i : {<string>:<start val>},
	o : {<string>:<start val>},
	op : {
		type : ( 'map' | 'func' ),
		data : ( function | {<output name> : <expression>})
	}
}
```	
