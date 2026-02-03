export const base64ToFile = (base64Str, fileName, callback) => {
  var index = base64Str.indexOf(',');
  var base64Str = base64Str.slice(index + 1, base64Str.length);

  plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
    fs.root.getFile(fileName, {
      create: true
    }, function(entry) {
      var fullPath = entry.fullPath;
      let platform = uni.getSystemInfoSync().platform;
      if (platform == 'android') {
        var Base64 = plus.android.importClass("android.util.Base64");
        var FileOutputStream = plus.android.importClass("java.io.FileOutputStream");
        try {
          var out = new FileOutputStream(fullPath);
          var bytes = Base64.decode(base64Str, Base64.DEFAULT);
          out.write(bytes);
          out.close();
          callback && callback(entry.toLocalURL());
        } catch (e) {
          console.log(e.message);
        }
      } else if (platform == 'ios') {
        var NSData = plus.ios.importClass('NSData');
        var nsData = new NSData();
        nsData = nsData.initWithBase64EncodedStringoptions(base64Str, 0);
        if (nsData) {
          nsData.plusCallMethod({
            writeToFile: fullPath,
            atomically: true
          });
          plus.ios.deleteObject(nsData);
        }
        callback && callback(entry.toLocalURL());
      }
    });
  });
}; 