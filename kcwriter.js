window.onload=main;

var _jsonlink;

var _parseModeSettings={};

function main()
{
    _jsonlink=document.querySelector(".new-text");

    console.log("selectParseMode(mode)");
    console.log("0: fcardsk");
    console.log("1: rmcards");
    console.log("2: fcards2");

    setupDropZone();
    selectParseMode(0);
}

//initialise drop zone related things
function setupDropZone()
{
    var dropzone=document.querySelector(".drop-zone");
    var slider=document.querySelector(".out-slider");

    dropzone.addEventListener("drop",(e)=>{
        e.preventDefault();
        slider.classList.remove("dragover");

        var datafile=e.dataTransfer.items[0].getAsFile();
        var datafileNameSplit=datafile.name.split(".");

        if (datafileNameSplit[datafileNameSplit.length-1]!="xlsx")
        {
            console.log("not an xlsx file");
            return;
        }

        readXls(datafile,datafileNameSplit[0]);
    });

    dropzone.addEventListener("dragover",(e)=>{
        e.preventDefault();
    });

    dropzone.addEventListener("dragenter",(e)=>{
        slider.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave",(e)=>{
        slider.classList.remove("dragover");
    });
}

//read given FIle object and string name, turn it into data
//and put it onto the button using attachData()
//also sets loaded state
function readXls(datafile,name)
{
    var f=new FileReader();
    f.onload=()=>{
        var wb=XLSX.read(f.result,{type:"binary"});

        var jsondata=XLSX.utils.sheet_to_json(wb.Sheets.Sheet1,{
            header:1
        });

        attachData(_parseModeSettings.parseFunction(jsondata),name);
        document.querySelector(".zones").classList.add("loaded");
    };

    f.readAsBinaryString(datafile);
}

//process data into fcardsk json
function parsefCardsK(jsondata)
{
    var formatdata=[];
    var rubys;
    var formatrubys;
    for (var x=0,l=jsondata.length;x<l;x++)
    {
        if (jsondata[x].length>3)
        {
            rubys=jsondata[x].slice(3);
            formatrubys=[];
            for (var y=0,yl=rubys.length;y<yl;y+=2)
            {
                formatrubys.push([rubys[y],rubys[y+1]]);
            }

            formatdata.push({
                maindata:jsondata[x].slice(0,3),
                rubys:formatrubys
            });
        }

        else
        {
            formatdata.push({maindata:jsondata[x]});
        }
    }

    return formatdata;
}

//set _parseModeSettings.beginId to start assigning ids at a different value
//useful for appending to already generated json
function parseRCards(data)
{
    var res=[];
    var currentData;
    var current;
    var id;

    if (_parseModeSettings.beginId)
    {
        id=_parseModeSettings.beginId;
    }

    else
    {
        id=0;
    }

    for (var x=0,l=data.length;x<l;x++)
    {
        currentData=data[x];

        current={
            name:currentData[0],
            place:currentData[1],
            time:currentData[2],
            material:currentData[3],
            img:currentData[4],
            id:id
        };

        if (currentData.length>5)
        {
            current.note=currentData[5];
        }

        res.push(current);
        id++;
    }

    return res;
}

function parsefCards2(data)
{
    var res=[];
    var currCard;
    for (var x=0,l=data.length;x<l;x++)
    {
        currCard=[data[x][0],data[x][1]];

        if (data[x].length>2)
        {
            currCard.push(data[x].slice(2))
        }

        res.push(currCard);
    }

    return res;
}

//parse functions should return a single object or array.
//this object will be assigned to an object with 1 field,
//the field is set with parsemodesettings.dataName
function selectParseMode(mode)
{
    switch (mode)
    {
        //fcardsk
        case 0:
        console.log("kcard mode");
        _parseModeSettings.dataName="kcards";
        _parseModeSettings.parseFunction=parsefCardsK;
        break;

        //rcards
        case 1:
        console.log("rcard mode");
        _parseModeSettings.dataName="data";
        _parseModeSettings.parseFunction=parseRCards;
        break;

        //fcards2
        case 2:
        console.log("fcard2 mode");
        _parseModeSettings.dataName="boxes";
        _parseModeSettings.parseFunction=parsefCards2;
        break;
    }
}

//prepare json download button for downloading
function attachData(data,name)
{
    var resData={};
    resData[_parseModeSettings.dataName]=data;
    _jsonlink.href=`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(resData))}`;
    _jsonlink.download=`${name}.json`;
}