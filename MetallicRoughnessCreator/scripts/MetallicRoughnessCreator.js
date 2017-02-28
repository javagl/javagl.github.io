
var inputImageDatas = [undefined, undefined, undefined];
var outputImageData;

function isUndefined(object)
{
    return (typeof object == "undefined");
}

function isDefined(object)
{
    return !isUndefined(object);
}

function combine(outputImageData, flip)
{
    var outputPixelData = outputImageData.data;
    var w = outputImageData.width;
    var h = outputImageData.height;

    for (var i = 0; i < 3; i++)
    {
        var inputImageData = inputImageDatas[i];
        if (isUndefined(inputImageData))
        {
            continue;
        }
        var inputPixelData = inputImageData.data;
        for (var y = 0; y < h; y++)
        {
            var inputOffset = y * inputImageData.width;
            var outputOffset = y * outputImageData.width;
            if (flip)
            {
                outputOffset = (outputImageData.height - 1 - y) * outputImageData.width
            }
            for (var x = 0; x < w; x++)
            {
                var inputIndex = x + inputOffset;
                var value = inputPixelData[inputIndex << 2];
                var outputIndex = x + outputOffset;
                outputPixelData[(outputIndex << 2) + i] = value;
                outputPixelData[(outputIndex << 2) + 3] = 255;
            }
        }
    }
}

function haveEqualSize(imageDataA, imageDataB)
{
    if (isUndefined(imageDataA))
    {
        return true;
    }
    if (isUndefined(imageDataB))
    {
        return true;
    }
    return imageDataA.width == imageDataB.width && imageDataA.height == imageDataB.height;
}


function checkEqualWidths(nameA, imageDataA, nameB, imageDataB, infoElement)
{
    if (!haveEqualSize(imageDataA, imageDataB))
    {
        infoElement.innerHTML +=
            "Warning: Different size: " +
            nameA + " is " + imageDataA.width + "x" + imageDataA.height + " and " +
            nameB + " is " + imageDataB.width + "x" + imageDataB.height + "<br>";
    }
}


function updateOutput()
{
    var infoElement = document.getElementById("outputImageInfo");

    infoElement.innerHTML = ""

    var rImageData = inputImageDatas[0];
    var gImageData = inputImageDatas[1];
    var bImageData = inputImageDatas[2];

    if (isUndefined(rImageData) &&
        isUndefined(gImageData) &&
        isUndefined(bImageData))
    {
        infoElement.innerHTML +=
            "No input images" + "<br>";
        return;
    }

    checkEqualWidths("r", rImageData, "g", gImageData, infoElement);
    checkEqualWidths("g", gImageData, "b", bImageData, infoElement);
    checkEqualWidths("r", rImageData, "b", bImageData, infoElement);


    var width = (1<<16);
    if (isDefined(rImageData)) width = Math.min(width, rImageData.width);
    if (isDefined(gImageData)) width = Math.min(width, gImageData.width);
    if (isDefined(bImageData)) width = Math.min(width, bImageData.width);

    var height = (1<<16);
    if (isDefined(rImageData)) height = Math.min(height, rImageData.height);
    if (isDefined(gImageData)) height = Math.min(height, gImageData.height);
    if (isDefined(bImageData)) height = Math.min(height, bImageData.height);

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    outputImageData = context.createImageData(width, height);

    var flip = document.getElementById("flipVerticallyCheckBox").checked;
    combine(outputImageData, flip);

    context.putImageData(outputImageData, 0, 0);

    var typeForm = document.getElementById("typeForm");
    if (typeForm.elements[0].checked)
    {
        var outputImage = document.getElementById("outputImage");
        outputImage.src = canvas.toDataURL("image/png");
    }
    if (typeForm.elements[1].checked)
    {
        var outputImage = document.getElementById("outputImage");
        outputImage.src = canvas.toDataURL("image/jpeg", 0.9);
    }
    if (typeForm.elements[2].checked)
    {
        var outputImage = document.getElementById("outputImage");
        outputImage.src = canvas.toDataURL("image/jpeg", 0.7);
    }

}


function imageFileLoaded(event, index, image, infoElement)
{
    var fullImage = document.createElement('img');
    fullImage.onload = function() {
        infoElement.innerHTML = fullImage.width + " x " + fullImage.height;
        var imageData = obtainImageData(fullImage);
        inputImageDatas[index] = imageData;
        //updateOutput();
    };
    fullImage.src = event.target.result;

    image.src = event.target.result;
}


function obtainImageData(image)
{
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0);
    var imageData = context.getImageData(
        0, 0, image.width, image.height);
    return imageData;
};


function handleFileSelect(event, index, image, infoElement)
{
    event.stopPropagation();
    event.preventDefault();

    var fileList = event.dataTransfer.files;
    if (fileList.length != 1)
    {
        infoElement.innerHTML = "Only a single file is allowed. Dropped "+fileList.length+" files";
        return;
    }

    var file = fileList[0];
    if (!file.type.match('image.*'))
    {
        infoElement.innerHTML = "Expected image file, but found "+file.type;
        return;
    }

    var reader = new FileReader();
    reader.onload = function(e)
    {
        imageFileLoaded(e, index, image, infoElement);
    };
    reader.readAsDataURL(file);

}

function handleDragOver(event)
{
    event.stopPropagation();
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}
