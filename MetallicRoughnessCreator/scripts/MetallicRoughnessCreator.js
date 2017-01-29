
var inputImageDatas = [undefined, undefined];
var outputImageData;


function combine(metallicImageData, roughnessImageData, outputImageData, flip)
{
    var metallicPixelData = metallicImageData.data;
    var roughnessPixelData = roughnessImageData.data;
    var outputPixelData = outputImageData.data;
    
    var w = outputImageData.width;
    var h = outputImageData.height;
    for (var y = 0; y < h; y++)
    {
        var metallicOffset = y * metallicImageData.width;
        var roughnessOffset = y * roughnessImageData.width;
        var outputOffset = y * outputImageData.width;
        if (flip)
        {
            outputOffset = (outputImageData.height - 1 - y) * outputImageData.width
        }
        for (var x = 0; x < w; x++)
        {
            var metallicIndex = x + metallicOffset;
            var red = metallicPixelData[metallicIndex << 2];
            
            var roughnessIndex = x + roughnessOffset;
            var green = roughnessPixelData[roughnessIndex << 2];
            
            var outputIndex = x + outputOffset;
            
            outputPixelData[(outputIndex << 2) + 0] = red;
            outputPixelData[(outputIndex << 2) + 1] = green;
            outputPixelData[(outputIndex << 2) + 2] = 0;
            outputPixelData[(outputIndex << 2) + 3] = 255;
        }
    }
}


function updateOutput()
{
    if (inputImageDatas[0] === undefined)
    {
        return;  
    }
    if (inputImageDatas[1] === undefined)
    {
        return;  
    }
    
    var infoElement = document.getElementById("outputImageInfo");
    
    var metallicImageData = inputImageDatas[0];
    var roughnessImageData = inputImageDatas[1];
    
    if (metallicImageData.width != roughnessImageData.width)
    {
        infoElement.innerHTML += 
          "Warning: Different widths: " + metallicImageData.width + 
          " and "+ roughnessImageData.width + "<br>";
    }
    if (metallicImageData.height != roughnessImageData.height)
    {
        infoElement.innerHTML += 
          "Warning: Different heights: " + metallicImageData.height + 
          " and "+ roughnessImageData.height + "<br>";
    }
    
    var width = Math.min(metallicImageData.width, roughnessImageData.width);
    var height = Math.min(metallicImageData.height, roughnessImageData.height);
    
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');
    outputImageData = context.createImageData(width, height);
    
    var flip = document.getElementById("flipVerticallyCheckBox").checked;
    combine(metallicImageData, roughnessImageData, outputImageData, flip);
    
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
