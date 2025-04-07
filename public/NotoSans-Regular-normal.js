// public/NotoSans-Regular-normal.js
(function (jsPDFAPI) {
    "use strict";
    jsPDFAPI.addFileToVFS('NotoSans-Regular-normal.ttf',''); // Здесь должен быть base64-encoded шрифт
    jsPDFAPI.addFont('NotoSans-Regular-normal.ttf','NotoSans','normal');
})(jsPDF.API);