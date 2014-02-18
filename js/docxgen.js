(function() {
  var env, root;

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  root.XmlUtil(root.XmlUtil = (function() {
    function XmlUtil() {}

    XmlUtil.prototype.getListXmlElements = function(text, start, end) {
      var i, innerCurrentTag, innerLastTag, justOpened, lastTag, result, tag, tags, _i, _len;
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = text.length - 1;
      }

      /*
      		get the different closing and opening tags between two texts (doesn't take into account tags that are opened then closed (those that are closed then opened are returned)):
      		returns:[{"tag":"</w:r>","offset":13},{"tag":"</w:p>","offset":265},{"tag":"</w:tc>","offset":271},{"tag":"<w:tc>","offset":828},{"tag":"<w:p>","offset":883},{"tag":"<w:r>","offset":1483}]
       */
      tags = DocUtils.preg_match_all("<(\/?[^/> ]+)([^>]*)>", text.substr(start, end));
      result = [];
      for (i = _i = 0, _len = tags.length; _i < _len; i = ++_i) {
        tag = tags[i];
        if (tag[1][0] === '/') {
          justOpened = false;
          if (result.length > 0) {
            lastTag = result[result.length - 1];
            innerLastTag = lastTag.tag.substr(1, lastTag.tag.length - 2);
            innerCurrentTag = tag[1].substr(1);
            if (innerLastTag === innerCurrentTag) {
              justOpened = true;
            }
          }
          if (justOpened) {
            result.pop();
          } else {
            result.push({
              tag: '<' + tag[1] + '>',
              offset: tag.offset
            });
          }
        } else if (tag[2][tag[2].length - 1] === '/') {

        } else {
          result.push({
            tag: '<' + tag[1] + '>',
            offset: tag.offset
          });
        }
      }
      return result;
    };

    XmlUtil.prototype.getListDifferenceXmlElements = function(text, start, end) {
      var scope;
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = text.length - 1;
      }
      scope = this.getListXmlElements(text, start, end);
      while (1.) {
        if (scope.length <= 1) {
          break;
        }
        if (scope[0].tag.substr(2) === scope[scope.length - 1].tag.substr(1)) {
          scope.pop();
          scope.shift();
        } else {
          break;
        }
      }
      return scope;
    };

    return XmlUtil;

  })());

}).call(this);

(function() {
  var TemplaterState, env, root;

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  root.TemplaterState = TemplaterState = (function() {
    function TemplaterState() {}

    TemplaterState.prototype.calcStartTag = function(tag) {
      return this.matches[tag.start.numXmlTag].offset + this.matches[tag.start.numXmlTag][1].length + this.charactersAdded[tag.start.numXmlTag] + tag.start.numCharacter;
    };

    TemplaterState.prototype.calcEndTag = function(tag) {
      return this.matches[tag.end.numXmlTag].offset + this.matches[tag.end.numXmlTag][1].length + this.charactersAdded[tag.end.numXmlTag] + tag.end.numCharacter + 1;
    };

    TemplaterState.prototype.initialize = function() {
      this.inForLoop = false;
      this.inTag = false;
      this.inDashLoop = false;
      return this.textInsideTag = "";
    };

    TemplaterState.prototype.startTag = function() {
      if (this.inTag === true) {
        throw "Tag already open with text: " + this.textInsideTag;
      }
      this.inTag = true;
      this.textInsideTag = "";
      return this.tagStart = this.currentStep;
    };

    TemplaterState.prototype.loopType = function() {
      if (this.inDashLoop) {
        return 'dash';
      }
      if (this.inForLoop) {
        return 'for';
      }
      return 'simple';
    };

    TemplaterState.prototype.endTag = function() {
      var dashInnerRegex;
      if (this.inTag === false) {
        throw "Tag already closed";
      }
      this.inTag = false;
      this.tagEnd = this.currentStep;
      if (this.textInsideTag[0] === '#' && this.loopType() === 'simple') {
        this.inForLoop = true;
        this.loopOpen = {
          'start': this.tagStart,
          'end': this.tagEnd,
          'tag': this.textInsideTag.substr(1)
        };
      }
      if (this.textInsideTag[0] === '-' && this.loopType() === 'simple') {
        this.inDashLoop = true;
        dashInnerRegex = /^-([a-zA-Z_:]+) ([a-zA-Z_:]+)$/;
        this.loopOpen = {
          'start': this.tagStart,
          'end': this.tagEnd,
          'tag': this.textInsideTag.replace(dashInnerRegex, '$2'),
          'element': this.textInsideTag.replace(dashInnerRegex, '$1')
        };
      }
      if (this.textInsideTag[0] === '/') {
        return this.loopClose = {
          'start': this.tagStart,
          'end': this.tagEnd
        };
      }
    };

    return TemplaterState;

  })();

}).call(this);

(function() {
  var ImgManager, env, root,
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  ImgManager = ImgManager = (function() {
    var imageExtensions;

    imageExtensions = ['gif', 'jpeg', 'jpg', 'emf', 'png'];

    function ImgManager(zip) {
      this.zip = zip;
      this;
    }

    ImgManager.prototype.getImageList = function() {
      var extension, imageList, index, regex;
      regex = /[^.]+\.([^.]+)/;
      imageList = [];
      for (index in this.zip.files) {
        extension = index.replace(regex, '$1');
        if (__indexOf.call(imageExtensions, extension) >= 0) {
          imageList.push({
            "path": index,
            files: this.zip.files[index]
          });
        }
      }
      return imageList;
    };

    ImgManager.prototype.setImage = function(fileName, data, options) {
      if (options == null) {
        options = {};
      }
      this.zip.remove(fileName);
      return this.zip.file(fileName, data, options);
    };

    ImgManager.prototype.loadImageRels = function() {
      var RidArray, content, tag;
      content = DocUtils.decode_utf8(this.zip.files["word/_rels/document.xml.rels"].asText());
      this.xmlDoc = DocUtils.Str2xml(content);
      RidArray = (function() {
        var _i, _len, _ref, _results;
        _ref = this.xmlDoc.getElementsByTagName('Relationship');
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          tag = _ref[_i];
          _results.push(parseInt(tag.getAttribute("Id").substr(3)));
        }
        return _results;
      }).call(this);
      this.maxRid = RidArray.max();
      this.imageRels = [];
      return this;
    };

    ImgManager.prototype.addExtensionRels = function(contentType, extension) {
      var addTag, content, defaultTags, newTag, tag, types, xmlDoc, _i, _len;
      content = DocUtils.decode_utf8(this.zip.files["[Content_Types].xml"].asText());
      xmlDoc = DocUtils.Str2xml(content);
      addTag = true;
      defaultTags = xmlDoc.getElementsByTagName('Default');
      for (_i = 0, _len = defaultTags.length; _i < _len; _i++) {
        tag = defaultTags[_i];
        if (tag.getAttribute('Extension') === extension) {
          addTag = false;
        }
      }
      if (addTag) {
        types = xmlDoc.getElementsByTagName("Types")[0];
        newTag = xmlDoc.createElement('Default');
        newTag.namespaceURI = null;
        newTag.setAttribute('ContentType', contentType);
        newTag.setAttribute('Extension', extension);
        types.appendChild(newTag);
        return this.setImage("[Content_Types].xml", DocUtils.encode_utf8(DocUtils.xml2Str(xmlDoc)));
      }
    };

    ImgManager.prototype.addImageRels = function(imageName, imageData) {
      var extension, file, newTag, relationships;
      if (this.zip.files["word/media/" + imageName] != null) {
        throw 'file already exists';
        return false;
      }
      this.maxRid++;
      file = {
        'name': "word/media/" + imageName,
        'data': imageData,
        'options': {
          base64: false,
          binary: true,
          compression: null,
          date: new Date(),
          dir: false
        }
      };
      this.zip.file(file.name, file.data, file.options);
      extension = imageName.replace(/[^.]+\.([^.]+)/, '$1');
      this.addExtensionRels("image/" + extension, extension);
      relationships = this.xmlDoc.getElementsByTagName("Relationships")[0];
      newTag = this.xmlDoc.createElement('Relationship');
      newTag.namespaceURI = null;
      newTag.setAttribute('Id', "rId" + this.maxRid);
      newTag.setAttribute('Type', 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image');
      newTag.setAttribute('Target', "media/" + imageName);
      relationships.appendChild(newTag);
      this.setImage("word/_rels/document.xml.rels", DocUtils.encode_utf8(DocUtils.xml2Str(this.xmlDoc)));
      return this.maxRid;
    };

    ImgManager.prototype.getImageByRid = function(rId) {
      var cRId, path, relationship, relationships, _i, _len;
      relationships = this.xmlDoc.getElementsByTagName('Relationship');
      for (_i = 0, _len = relationships.length; _i < _len; _i++) {
        relationship = relationships[_i];
        cRId = relationship.getAttribute('Id');
        if (rId === cRId) {
          path = relationship.getAttribute('Target');
          if (path.substr(0, 6) === 'media/') {
            return this.zip.files["word/" + path];
          }
        }
      }
      return null;
    };

    return ImgManager;

  })();

  root.ImgManager = ImgManager;

}).call(this);


/*
Docxgen.coffee
Created by Edgar HIPP
02/11/2014
 */

(function() {
  var DocxGen, env, root;

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  root.DocxGen = DocxGen = (function() {
    var templatedFiles;

    templatedFiles = ["word/document.xml", "word/footer1.xml", "word/footer2.xml", "word/footer3.xml", "word/header1.xml", "word/header2.xml", "word/header3.xml"];

    function DocxGen(content, Tags, intelligentTagging, qrCode) {
      this.Tags = Tags != null ? Tags : {};
      this.intelligentTagging = intelligentTagging != null ? intelligentTagging : true;
      this.qrCode = qrCode != null ? qrCode : false;
      this.finishedCallback = function() {};
      this.localImageCreator = function(arg, callback) {
        var result;
        result = JSZipBase64.decode("iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAIAAABvSEP3AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAACXSURBVDhPtY7BDYAwDAMZhCf7b8YMxeCoatOQJhWc/KGxT2zlCyaWcz8Y+X7Bs1TFVJSwIHIYyFkQufWIRVX9cNJyW1QpEo4rixaEe7JuQagAUctb7ZFYFh5MVJPBe84CVBnB42//YsZRgKjFDBVg3cI9WbRwXLktQJX8cNIiFhM1ZuTWk7PIYSBhkVcLzwIiCjCxhCjlAkBqYnqFoQQ2AAAAAElFTkSuQmCC");
        return callback(result);
      };
      this.filesProcessed = 0;
      this.qrCodeNumCallBack = 0;
      this.qrCodeWaitingFor = [];
      if (content != null) {
        this.load(content);
      }
      this;
    }

    DocxGen.prototype.qrCodeCallBack = function(num, add) {
      var index;
      if (add == null) {
        add = true;
      }
      if (add === true) {
        this.qrCodeWaitingFor.push(num);
      } else if (add === false) {
        index = this.qrCodeWaitingFor.indexOf(num);
        this.qrCodeWaitingFor.splice(index, 1);
      }
      return this.testReady();
    };

    DocxGen.prototype.testReady = function() {
      if (this.qrCodeWaitingFor.length === 0 && this.filesProcessed === templatedFiles.length) {
        this.ready = true;
        return this.finishedCallback();
      }
    };

    DocxGen.prototype.logUndefined = function(tag, scope) {};

    DocxGen.prototype.getImageList = function() {
      return this.imgManager.getImageList();
    };

    DocxGen.prototype.setImage = function(path, data, options) {
      return this.imgManager.setImage(path, data, options);
    };

    DocxGen.prototype.load = function(content) {
      this.zip = new JSZip(content);
      return this.imgManager = (new ImgManager(this.zip)).loadImageRels();
    };

    DocxGen.prototype.applyTags = function(Tags, qrCodeCallback) {
      var currentFile, fileName, _i, _j, _len, _len1;
      this.Tags = Tags != null ? Tags : this.Tags;
      if (qrCodeCallback == null) {
        qrCodeCallback = null;
      }
      for (_i = 0, _len = templatedFiles.length; _i < _len; _i++) {
        fileName = templatedFiles[_i];
        if (this.zip.files[fileName] == null) {
          this.filesProcessed++;
        }
      }
      for (_j = 0, _len1 = templatedFiles.length; _j < _len1; _j++) {
        fileName = templatedFiles[_j];
        if (!(this.zip.files[fileName] != null)) {
          continue;
        }
        currentFile = new DocXTemplater(this.zip.files[fileName].asText(), {
          DocxGen: this,
          Tags: this.Tags,
          intelligentTagging: this.intelligentTagging,
          qrCodeCallback: qrCodeCallback,
          localImageCreator: this.localImageCreator
        }, this, this.Tags, this.intelligentTagging, [], {}, 0, qrCodeCallback, this.localImageCreator);
        this.setData(fileName, currentFile.applyTags().content);
        this.filesProcessed++;
      }
      return this.testReady();
    };

    DocxGen.prototype.setData = function(fileName, data, options) {
      if (options == null) {
        options = {};
      }
      this.zip.remove(fileName);
      return this.zip.file(fileName, data, options);
    };

    DocxGen.prototype.getTags = function() {
      var currentFile, fileName, usedTags, usedTemplateV, _i, _len;
      usedTags = [];
      for (_i = 0, _len = templatedFiles.length; _i < _len; _i++) {
        fileName = templatedFiles[_i];
        if (!(this.zip.files[fileName] != null)) {
          continue;
        }
        currentFile = new DocXTemplater(this.zip.files[fileName].asText(), {
          DocxGen: this,
          Tags: this.Tags,
          intelligentTagging: this.intelligentTagging
        });
        usedTemplateV = currentFile.applyTags().usedTags;
        if (DocUtils.sizeOfObject(usedTemplateV)) {
          usedTags.push({
            fileName: fileName,
            vars: usedTemplateV
          });
        }
      }
      return usedTags;
    };

    DocxGen.prototype.setTags = function(Tags) {
      this.Tags = Tags;
      return this;
    };

    DocxGen.prototype.output = function(download, name) {
      var result;
      if (download == null) {
        download = true;
      }
      if (name == null) {
        name = "output.docx";
      }
      result = this.zip.generate();
      if (download) {
        if (env === 'node') {
          fs.writeFile(process.cwd() + '/' + name, result, 'base64', function(err) {
            if (err) {
              throw err;
            }
          });
        } else {
          document.location.href = "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64," + result;
        }
      }
      return result;
    };

    DocxGen.prototype.getFullText = function(path, data) {
      var usedData;
      if (path == null) {
        path = "word/document.xml";
      }
      if (data == null) {
        data = "";
      }
      if (data === "") {
        usedData = this.zip.files[path].asText();
        return this.getFullText(path, usedData);
      }
      return (new DocXTemplater(data, {
        DocxGen: this,
        Tags: this.Tags,
        intelligentTagging: this.intelligentTagging
      })).getFullText();
    };

    DocxGen.prototype.download = function(swfpath, imgpath, filename) {
      var output;
      if (filename == null) {
        filename = "default.docx";
      }
      output = this.zip.generate();
      return Downloadify.create('downloadify', {
        filename: function() {
          return filename;
        },
        data: function() {
          return output;
        },
        onCancel: function() {
          return alert('You have cancelled the saving of this file.');
        },
        onError: function() {
          return alert('You must put something in the File Contents or there will be nothing to save!');
        },
        swf: swfpath,
        downloadImage: imgpath,
        width: 100,
        height: 30,
        transparent: true,
        append: false,
        dataType: 'base64'
      });
    };

    return DocxGen;

  })();

  if (env === 'node') {
    module.exports = root.DocxGen;
  }

}).call(this);

(function() {
  var env, root,
    __slice = [].slice;

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  root.DocUtils = {};

  root.docX = [];

  root.docXData = [];

  DocUtils.nl2br = function(str, is_xhtml) {
    return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + '<br>' + '$2');
  };

  DocUtils.config = {
    "baseNodePath": '../../examples/',
    "baseClientPath": '../examples/'
  };

  DocUtils.loadDoc = function(path, options) {
    var async, basePath, callback, data, e, errorCallback, fileName, httpRegex, intelligentTagging, loadFile, noDocx, req, reqCallback, totalPath, urloptions, xhrDoc;
    if (options == null) {
      options = {};
    }
    noDocx = options.docx != null ? !options.docx : false;
    async = options.async != null ? options.async : false;
    intelligentTagging = options.intelligentTagging != null ? options.intelligentTagging : false;
    callback = options.callback != null ? options.callback : null;
    basePath = options.basePath != null ? options.basePath : null;
    if (path == null) {
      throw 'path not defined';
    }
    if (path.indexOf('/') !== -1) {
      totalPath = path;
      fileName = totalPath;
    } else {
      fileName = path;
      if (basePath === null) {
        if (env === 'browser') {
          basePath = DocUtils.config.baseClientPath;
        } else {
          basePath = DocUtils.config.baseNodePath;
        }
      }
      totalPath = basePath + path;
    }
    loadFile = function(data) {
      root.docXData[fileName] = data;
      if (noDocx === false) {
        root.docX[fileName] = new DocxGen(data, {}, intelligentTagging);
      }
      if (callback != null) {
        callback(false);
      }
      if (async === false) {
        return root.docXData[fileName];
      }
    };
    if (env === 'browser') {
      xhrDoc = new XMLHttpRequest();
      xhrDoc.open('GET', totalPath, async);
      if (xhrDoc.overrideMimeType) {
        xhrDoc.overrideMimeType('text/plain; charset=x-user-defined');
      }
      xhrDoc.onreadystatechange = function(e) {
        if (this.readyState === 4) {
          if (this.status === 200) {
            return loadFile(this.response);
          } else {
            if (callback != null) {
              return callback(true);
            }
          }
        }
      };
      xhrDoc.send();
    } else {
      httpRegex = new RegExp("(https?)", "i");
      if (httpRegex.test(path)) {
        urloptions = url.parse(path);
        options = {
          hostname: urloptions.hostname,
          path: urloptions.path,
          method: 'GET',
          rejectUnauthorized: false
        };
        errorCallback = function(e) {};
        reqCallback = function(res) {
          var data;
          res.setEncoding('binary');
          data = "";
          res.on('data', function(chunk) {
            return data += chunk;
          });
          res.on('end', function() {
            return loadFile(data);
          });
          return res.on('error', function(err) {});
        };
        switch (urloptions.protocol) {
          case "https:":
            req = https.request(options, reqCallback).on('error', errorCallback);
            break;
          case 'http:':
            req = http.request(options, reqCallback).on('error', errorCallback);
        }
        req.end();
      } else {
        if (async === true) {
          fs.readFile(totalPath, "binary", function(err, data) {
            if (err) {
              if (callback != null) {
                return callback(true);
              }
            } else {
              loadFile(data);
              if (callback != null) {
                return callback(false);
              }
            }
          });
        } else {
          try {
            data = fs.readFileSync(totalPath, "binary");
            loadFile(data);
            if (callback != null) {
              callback(false);
            }
          } catch (_error) {
            e = _error;
            if (callback != null) {
              callback(true);
            }
          }
        }
      }
    }
    return fileName;
  };

  DocUtils.clone = function(obj) {
    var flags, key, newInstance;
    if ((obj == null) || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      flags = '';
      if (obj.global != null) {
        flags += 'g';
      }
      if (obj.ignoreCase != null) {
        flags += 'i';
      }
      if (obj.multiline != null) {
        flags += 'm';
      }
      if (obj.sticky != null) {
        flags += 'y';
      }
      return new RegExp(obj.source, flags);
    }
    newInstance = new obj.constructor();
    for (key in obj) {
      newInstance[key] = DocUtils.clone(obj[key]);
    }
    return newInstance;
  };

  DocUtils.xml2Str = function(xmlNode) {
    var a, content, e;
    if (xmlNode === void 0) {
      throw "xmlNode undefined!";
    }
    try {
      if (typeof global !== "undefined" && global !== null) {
        a = new XMLSerializer();
        content = a.serializeToString(xmlNode);
      } else {
        content = (new XMLSerializer()).serializeToString(xmlNode);
      }
    } catch (_error) {
      e = _error;
      content = xmlNode.xml;
    }
    return content = content.replace(/\x20xmlns=""/g, '');
  };

  DocUtils.Str2xml = function(str) {
    var parser, xmlDoc;
    if (root.DOMParser) {
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(str, "text/xml");
    } else {
      xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
      xmlDoc.async = false;
      xmlDoc.loadXML(str);
    }
    return xmlDoc;
  };

  DocUtils.replaceFirstFrom = function(string, search, replace, from) {
    return string.substr(0, from) + string.substr(from).replace(search, replace);
  };

  DocUtils.encode_utf8 = function(s) {
    return unescape(encodeURIComponent(s));
  };

  DocUtils.decode_utf8 = function(s) {
    var e, i, t, _i, _len;
    try {
      if (s === void 0) {
        return void 0;
      }
      return decodeURIComponent(escape(s.replace(new RegExp(String.fromCharCode(160), "g"), " ")));
    } catch (_error) {
      e = _error;
      console.log('could not decode');
      console.log(s);
      window.s = s;
      for (i = _i = 0, _len = s.length; _i < _len; i = ++_i) {
        t = s[i];
        if (i > 0) {
          DocUtils.decode_utf8(t);
        }
      }
      throw 'end';
    }
  };

  DocUtils.base64encode = function(b) {
    return btoa(unescape(encodeURIComponent(b)));
  };

  DocUtils.preg_match_all = function(regex, content) {

    /*regex is a string, content is the content. It returns an array of all matches with their offset, for example:
    	regex=la
    	content=lolalolilala
    	returns: [{0:'la',offset:2},{0:'la',offset:8},{0:'la',offset:10}]
     */
    var matchArray, replacer;
    if (!(typeof regex === 'object')) {
      regex = new RegExp(regex, 'g');
    }
    matchArray = [];
    replacer = function() {
      var match, offset, pn, string, _i;
      match = arguments[0], pn = 4 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 2) : (_i = 1, []), offset = arguments[_i++], string = arguments[_i++];
      pn.unshift(match);
      pn.offset = offset;
      return matchArray.push(pn);
    };
    content.replace(regex, replacer);
    return matchArray;
  };

  DocUtils.sizeOfObject = function(obj) {
    var key, log, size;
    size = 0;
    log = 0;
    for (key in obj) {
      size++;
    }
    return size;
  };

  Array.prototype.max = function() {
    return Math.max.apply(null, this);
  };

  Array.prototype.min = function() {
    return Math.min.apply(null, this);
  };

}).call(this);

(function() {
  var ImgReplacer, env, root;

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  ImgReplacer = ImgReplacer = (function() {
    function ImgReplacer(xmlTemplater) {
      this.xmlTemplater = xmlTemplater;
      this.imgMatches = [];
      this;
    }

    ImgReplacer.prototype.findImages = function() {
      this.imgMatches = DocUtils.preg_match_all(/<w:drawing[^>]*>.*?<\/w:drawing>/g, this.xmlTemplater.content);
      return this;
    };

    ImgReplacer.prototype.replaceImages = function() {
      var callback, imageTag, imgData, imgName, match, newId, oldFile, qr, rId, replacement, tag, tagrId, u, xmlImg, _i, _len, _ref, _results;
      qr = [];
      callback = function(docxqrCode) {
        docxqrCode.xmlTemplater.numQrCode--;
        docxqrCode.xmlTemplater.DocxGen.setImage("word/media/" + docxqrCode.imgName, docxqrCode.data);
        return docxqrCode.xmlTemplater.DocxGen.qrCodeCallBack(docxqrCode.num, false);
      };
      _ref = this.imgMatches;
      _results = [];
      for (u = _i = 0, _len = _ref.length; _i < _len; u = ++_i) {
        match = _ref[u];
        xmlImg = DocUtils.Str2xml('<?xml version="1.0" ?><w:document mc:Ignorable="w14 wp14" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape">' + match[0] + '</w:document>');
        if (this.xmlTemplater.DocxGen.qrCode) {
          tagrId = xmlImg.getElementsByTagNameNS('*', 'blip')[0];
          if (tagrId === void 0) {
            tagrId = xmlImg.getElementsByTagName("a:blip")[0];
          }
          if (tagrId !== void 0) {
            rId = tagrId.getAttribute('r:embed');
            oldFile = this.xmlTemplater.DocxGen.imgManager.getImageByRid(rId);
            if (oldFile !== null) {
              tag = xmlImg.getElementsByTagNameNS('*', 'docPr')[0];
              if (tag === void 0) {
                tag = xmlImg.getElementsByTagName('wp:docPr')[0];
              }
              if (tag !== void 0) {
                if (tag.getAttribute("name").substr(0, 6) !== "Copie_") {
                  imgName = ("Copie_" + this.xmlTemplater.imageId + ".png").replace(/\x20/, "");
                  this.xmlTemplater.DocxGen.qrCodeNumCallBack++;
                  this.xmlTemplater.DocxGen.qrCodeCallBack(this.xmlTemplater.DocxGen.qrCodeNumCallBack, true);
                  newId = this.xmlTemplater.DocxGen.imgManager.addImageRels(imgName, "");
                  this.xmlTemplater.imageId++;
                  this.xmlTemplater.DocxGen.setImage("word/media/" + imgName, oldFile.data);
                  if (env === 'browser') {
                    qr[u] = new DocxQrCode(oldFile.asBinary(), this.xmlTemplater, imgName, this.xmlTemplater.DocxGen.qrCodeNumCallBack);
                  }
                  tag.setAttribute('name', "" + imgName);
                  tagrId.setAttribute('r:embed', "rId" + newId);
                  imageTag = xmlImg.getElementsByTagNameNS('*', 'drawing')[0];
                  if (imageTag === void 0) {
                    imageTag = xmlImg.getElementsByTagName('w:drawing')[0];
                  }
                  replacement = DocUtils.xml2Str(imageTag);
                  this.xmlTemplater.content = this.xmlTemplater.content.replace(match[0], replacement);
                  this.xmlTemplater.numQrCode++;
                  if (env === 'browser') {
                    _results.push(qr[u].decode(callback));
                  } else {
                    if (/\.png$/.test(oldFile.name)) {
                      _results.push((function(_this) {
                        return function(imgName) {
                          var base64, binaryData, dat, finished, png;
                          base64 = JSZipBase64.encode(oldFile.data);
                          binaryData = new Buffer(base64, 'base64');
                          png = new PNG(binaryData);
                          finished = function(a) {
                            var e;
                            try {
                              png.decoded = a;
                              qr[u] = new DocxQrCode(png, _this.xmlTemplater, imgName, _this.xmlTemplater.DocxGen.qrCodeNumCallBack);
                              return qr[u].decode(callback);
                            } catch (_error) {
                              e = _error;
                              console.log(e);
                              return _this.xmlTemplater.DocxGen.qrCodeCallBack(_this.xmlTemplater.DocxGen.qrCodeNumCallBack, false);
                            }
                          };
                          return dat = png.decode(finished);
                        };
                      })(this)(imgName));
                    } else {
                      _results.push(this.xmlTemplater.DocxGen.qrCodeCallBack(this.xmlTemplater.DocxGen.qrCodeNumCallBack, false));
                    }
                  }
                } else {
                  _results.push(void 0);
                }
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else if (this.xmlTemplater.currentScope["img"] != null) {
          if (this.xmlTemplater.currentScope["img"][u] != null) {
            imgName = this.xmlTemplater.currentScope["img"][u].name;
            imgData = this.xmlTemplater.currentScope["img"][u].data;
            if (this.xmlTemplater.DocxGen == null) {
              throw 'DocxGen not defined';
            }
            newId = this.xmlTemplater.DocxGen.imgManager.addImageRels(imgName, imgData);
            tag = xmlImg.getElementsByTagNameNS('*', 'docPr')[0];
            if (tag === void 0) {
              tag = xmlImg.getElementsByTagName('wp:docPr')[0];
            }
            if (tag !== void 0) {
              this.xmlTemplater.imageId++;
              tag.setAttribute('id', this.xmlTemplater.imageId);
              tag.setAttribute('name', "" + imgName);
              tagrId = xmlImg.getElementsByTagNameNS('*', 'blip')[0];
              if (tagrId === void 0) {
                tagrId = xmlImg.getElementsByTagName("a:blip")[0];
              }
              if (tagrId !== void 0) {
                tagrId.setAttribute('r:embed', "rId" + newId);
                imageTag = xmlImg.getElementsByTagNameNS('*', 'drawing')[0];
                if (imageTag === void 0) {
                  imageTag = xmlImg.getElementsByTagName('w:drawing')[0];
                }
                _results.push(this.xmlTemplater.content = this.xmlTemplater.content.replace(match[0], DocUtils.xml2Str(imageTag)));
              } else {
                _results.push(void 0);
              }
            } else {
              _results.push(void 0);
            }
          } else {
            _results.push(void 0);
          }
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };

    return ImgReplacer;

  })();

  root.ImgReplacer = ImgReplacer;

}).call(this);

(function() {
  var DocxQrCode, env, root;

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  DocxQrCode = DocxQrCode = (function() {
    function DocxQrCode(imageData, xmlTemplater, imgName, num, callback) {
      this.xmlTemplater = xmlTemplater;
      this.imgName = imgName != null ? imgName : "";
      this.num = num;
      this.callback = callback;
      this.data = imageData;
      console.log(this.data);
      this.base64Data = JSZip.base64.encode(this.data);
      console.log(this.base64Data);
      this.ready = false;
      this.result = null;
    }

    DocxQrCode.prototype.decode = function(callback) {
      var _this;
      this.callback = callback;
      _this = this;
      this.qr = new QrCode();
      this.qr.callback = function() {
        var testdoc;
        _this.ready = true;
        _this.result = this.result;
        testdoc = new _this.xmlTemplater.currentClass(this.result, _this.xmlTemplater.toJson());
        testdoc.applyTags();
        _this.result = testdoc.content;
        return _this.searchImage();
      };
      if (env === 'browser') {
        return this.qr.decode("data:image/png;base64," + this.base64Data);
      } else {
        return this.qr.decode(this.data, this.data.decoded);
      }
    };

    DocxQrCode.prototype.searchImage = function() {
      var callback, error, loadDocCallback;
      if (this.result.substr(0, 4) === 'gen:') {
        return callback = (function(_this) {
          return function(data) {
            _this.data = data;
            _this.callback(_this, _this.imgName, _this.num);
            return _this.xmlTemplater.DocxGen.localImageCreator(_this.result, callback);
          };
        })(this);
      } else if (this.result !== null && this.result !== void 0 && this.result.substr(0, 22) !== 'error decoding QR Code') {
        loadDocCallback = (function(_this) {
          return function(fail) {
            if (fail == null) {
              fail = false;
            }
            if (!fail) {
              _this.data = docXData[_this.result];
              return _this.callback(_this, _this.imgName, _this.num);
            } else {
              return _this.callback(_this, _this.imgName, _this.num);
            }
          };
        })(this);
        try {
          return DocUtils.loadDoc(this.result, {
            docx: false,
            callback: loadDocCallback,
            async: false
          });
        } catch (_error) {
          error = _error;
          return console.log(error);
        }
      } else {
        return this.callback(this, this.imgName, this.num);
      }
    };

    return DocxQrCode;

  })();

  root.DocxQrCode = DocxQrCode;

}).call(this);

(function() {
  var XmlTemplater, env, root,
    __slice = [].slice;

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  XmlTemplater = XmlTemplater = (function() {
    function XmlTemplater(content, options) {
      if (content == null) {
        content = "";
      }
      if (options == null) {
        options = {};
      }
      this.tagXml = '';
      this.currentClass = XmlTemplater;
      this.fromJson(options);
      this.currentScope = this.Tags;
      this.templaterState = new TemplaterState;
    }

    XmlTemplater.prototype.load = function(content) {
      var i;
      this.content = content;
      this.templaterState.matches = this._getFullTextMatchesFromData();
      this.templaterState.charactersAdded = (function() {
        var _i, _ref, _results;
        _results = [];
        for (i = _i = 0, _ref = this.templaterState.matches.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
          _results.push(0);
        }
        return _results;
      }).call(this);
      return this.handleRecursiveCase();
    };

    XmlTemplater.prototype.getValueFromScope = function(tag, scope) {
      var value;
      if (tag == null) {
        tag = this.templaterState.loopOpen.tag;
      }
      if (scope == null) {
        scope = this.currentScope;
      }
      if (scope[tag] != null) {
        if (typeof scope[tag] === 'string') {
          this.useTag(tag);
          value = DocUtils.encode_utf8(scope[tag]);
          if (value.indexOf('{') !== -1 || value.indexOf('}') !== -1) {
            throw "You can't enter { or  } inside the content of a variable";
          }
        } else {
          value = scope[tag];
        }
      } else {
        this.useTag(tag);
        value = "undefined";
        this.DocxGen.logUndefined(tag, scope);
      }
      return value;
    };

    XmlTemplater.prototype.getFullText = function() {
      var match, output;
      this.templaterState.matches = this._getFullTextMatchesFromData();
      output = (function() {
        var _i, _len, _ref, _results;
        _ref = this.templaterState.matches;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          match = _ref[_i];
          _results.push(match[2]);
        }
        return _results;
      }).call(this);
      return DocUtils.decode_utf8(output.join(""));
    };

    XmlTemplater.prototype._getFullTextMatchesFromData = function() {
      return this.templaterState.matches = DocUtils.preg_match_all("(<" + this.tagXml + "[^>]*>)([^<>]*)</" + this.tagXml + ">", this.content);
    };

    XmlTemplater.prototype.calcOuterXml = function(text, start, end, xmlTag) {
      var endTag, startTag;
      endTag = text.indexOf('</' + xmlTag + '>', end);
      if (endTag === -1) {
        throw "can't find endTag " + endTag;
      }
      endTag += ('</' + xmlTag + '>').length;
      startTag = Math.max(text.lastIndexOf('<' + xmlTag + '>', start), text.lastIndexOf('<' + xmlTag + ' ', start));
      if (startTag === -1) {
        throw "can't find startTag";
      }
      return {
        "text": text.substr(startTag, endTag - startTag),
        startTag: startTag,
        endTag: endTag
      };
    };

    XmlTemplater.prototype.findOuterTagsContent = function() {
      var end, start;
      start = this.templaterState.calcStartTag(this.templaterState.loopOpen);
      end = this.templaterState.calcEndTag(this.templaterState.loopClose);
      return {
        content: this.content.substr(start, end - start),
        start: start,
        end: end
      };
    };

    XmlTemplater.prototype.findInnerTagsContent = function() {
      var end, start;
      start = this.templaterState.calcEndTag(this.templaterState.loopOpen);
      end = this.templaterState.calcStartTag(this.templaterState.loopClose);
      return {
        content: this.content.substr(start, end - start),
        start: start,
        end: end
      };
    };

    XmlTemplater.prototype.fromJson = function(options) {
      this.Tags = options.Tags != null ? options.Tags : {};
      this.DocxGen = options.DocxGen != null ? options.DocxGen : null;
      this.intelligentTagging = options.intelligentTagging != null ? options.intelligentTagging : false;
      this.scopePath = options.scopePath != null ? options.scopePath : [];
      this.usedTags = options.usedTags != null ? options.usedTags : {};
      return this.imageId = options.imageId != null ? options.imageId : 0;
    };

    XmlTemplater.prototype.toJson = function() {
      return {
        Tags: DocUtils.clone(this.Tags),
        DocxGen: this.DocxGen,
        intelligentTagging: DocUtils.clone(this.intelligentTagging),
        scopePath: DocUtils.clone(this.scopePath),
        usedTags: this.usedTags,
        localImageCreator: this.localImageCreator,
        imageId: this.imageId
      };
    };

    XmlTemplater.prototype.forLoop = function(innerTagsContent, outerTagsContent) {
      var i, newContent, nextFile, scope, subfile, tagValue, _i, _len;
      if (innerTagsContent == null) {
        innerTagsContent = this.findInnerTagsContent().content;
      }
      if (outerTagsContent == null) {
        outerTagsContent = this.findOuterTagsContent().content;
      }

      /*
      			<w:t>{#forTag} blabla</w:t>
      			Blabla1
      			Blabla2
      			<w:t>{/forTag}</w:t>
      
      			Let innerTagsContent be what is in between the first closing tag and the second opening tag
      			Let outerTagsContent what is in between the first opening tag {# and the last closing tag
      
      			innerTagsContent=</w:t>
      			Blabla1
      			Blabla2
      			<w:t>
      
      			outerTagsContent={#forTag}</w:t>
      			Blabla1
      			Blabla2
      			<w:t>{/forTag}
      
      			We replace outerTagsContent by n*innerTagsContent, n is equal to the length of the array in scope forTag
      			<w:t>subContent subContent subContent</w:t>
       */
      tagValue = this.currentScope[this.templaterState.loopOpen.tag];
      newContent = "";
      if (tagValue != null) {
        if (typeof tagValue === 'object') {
          for (i = _i = 0, _len = tagValue.length; _i < _len; i = ++_i) {
            scope = tagValue[i];
            subfile = this.calcSubXmlTemplater(innerTagsContent, scope);
            newContent += subfile.content;
          }
        }
        if (tagValue === true) {
          subfile = this.calcSubXmlTemplater(innerTagsContent, this.currentScope);
          newContent += subfile.content;
        }
      } else {
        subfile = this.calcSubXmlTemplater(innerTagsContent, {});
      }
      this.content = this.content.replace(outerTagsContent, newContent);
      nextFile = this.calcSubXmlTemplater(this.content);
      if ((nextFile.getFullText().indexOf('{')) !== -1) {
        throw "they shouln't be a { in replaced file: " + (nextFile.getFullText()) + " (3)";
      }
      return nextFile;
    };

    XmlTemplater.prototype.dashLoop = function(elementDashLoop, sharp) {
      var content, copyinnerXmlText, end, innerXmlText, outerXml, outerXmlText, start, t, _i, _ref, _ref1;
      if (sharp == null) {
        sharp = false;
      }
      _ref = this.findOuterTagsContent(), content = _ref.content, start = _ref.start, end = _ref.end;
      outerXml = this.calcOuterXml(this.content, start, end, elementDashLoop);
      for (t = _i = 0, _ref1 = this.templaterState.matches.length; 0 <= _ref1 ? _i <= _ref1 : _i >= _ref1; t = 0 <= _ref1 ? ++_i : --_i) {
        this.templaterState.charactersAdded[t] -= outerXml.startTag;
      }
      outerXmlText = outerXml.text;
      if ((this.content.indexOf(outerXmlText)) === -1) {
        throw "couln't find outerXmlText in @content";
      }
      innerXmlText = outerXmlText;
      copyinnerXmlText = innerXmlText;
      this.templaterState.tagEnd = {
        "numXmlTag": this.templaterState.loopOpen.end.numXmlTag,
        "numCharacter": this.templaterState.loopOpen.end.numCharacter
      };
      this.templaterState.tagStart = {
        "numXmlTag": this.templaterState.loopOpen.start.numXmlTag,
        "numCharacter": this.templaterState.loopOpen.start.numCharacter
      };
      if (sharp === false) {
        this.templaterState.textInsideTag = "-" + this.templaterState.loopOpen.element + " " + this.templaterState.loopOpen.tag;
      }
      if (sharp === true) {
        this.templaterState.textInsideTag = "#" + this.templaterState.loopOpen.tag;
      }
      innerXmlText = this.replaceTagByValue("", innerXmlText);
      if (copyinnerXmlText === innerXmlText) {
        throw "innerXmlText should have changed after deleting the opening tag";
      }
      copyinnerXmlText = innerXmlText;
      this.templaterState.textInsideTag = "/" + this.templaterState.loopOpen.tag;
      this.templaterState.tagEnd = {
        "numXmlTag": this.templaterState.loopClose.end.numXmlTag,
        "numCharacter": this.templaterState.loopClose.end.numCharacter
      };
      this.templaterState.tagStart = {
        "numXmlTag": this.templaterState.loopClose.start.numXmlTag,
        "numCharacter": this.templaterState.loopClose.start.numCharacter
      };
      innerXmlText = this.replaceTagByValue("", innerXmlText);
      if (copyinnerXmlText === innerXmlText) {
        throw "innerXmlText should have changed after deleting the opening tag";
      }
      return this.forLoop(innerXmlText, outerXmlText);
    };

    XmlTemplater.prototype.xmlToBeReplaced = function(noStartTag, spacePreserve, insideValue, xmlTagNumber) {
      if (noStartTag === true) {
        return insideValue;
      } else {
        if (spacePreserve === true) {
          return "<" + this.tagXml + " xml:space=\"preserve\">" + insideValue + "</" + this.tagXml + ">";
        } else {
          return this.templaterState.matches[xmlTagNumber][1] + insideValue + ("</" + this.tagXml + ">");
        }
      }
    };

    XmlTemplater.prototype.replaceXmlTag = function(content, options) {
      var copyContent, insideValue, noStartTag, replacer, spacePreserve, startTag, xmlTagNumber;
      xmlTagNumber = options.xmlTagNumber;
      insideValue = options.insideValue;
      spacePreserve = options.spacePreserve != null ? options.spacePreserve : true;
      noStartTag = options.noStartTag != null ? options.noStartTag : false;
      replacer = this.xmlToBeReplaced(noStartTag, spacePreserve, insideValue, xmlTagNumber);
      this.templaterState.matches[xmlTagNumber][2] = insideValue;
      startTag = this.templaterState.matches[xmlTagNumber].offset + this.templaterState.charactersAdded[xmlTagNumber];
      this.templaterState.charactersAdded[xmlTagNumber + 1] += replacer.length - this.templaterState.matches[xmlTagNumber][0].length;
      if (content.indexOf(this.templaterState.matches[xmlTagNumber][0]) === -1) {
        throw "content " + this.templaterState.matches[xmlTagNumber][0] + " not found in content";
      }
      copyContent = content;
      content = DocUtils.replaceFirstFrom(content, this.templaterState.matches[xmlTagNumber][0], replacer, startTag);
      this.templaterState.matches[xmlTagNumber][0] = replacer;
      if (copyContent === content) {
        throw "offset problem0: didnt changed the value (should have changed from " + this.templaterState.matches[this.templaterState.tagStart.numXmlTag][0] + " to " + replacer;
      }
      return content;
    };

    XmlTemplater.prototype.replaceTagByValue = function(newValue, content) {
      var copyContent, insideValue, j, k, match, regexLeft, regexRight, subMatches, _i, _j, _len, _ref, _ref1, _ref2;
      if (content == null) {
        content = this.content;
      }
      if ((this.templaterState.matches[this.templaterState.tagEnd.numXmlTag][2].indexOf('}')) === -1) {
        throw "no closing tag at @templaterState.tagEnd.numXmlTag " + this.templaterState.matches[this.templaterState.tagEnd.numXmlTag][2];
      }
      if ((this.templaterState.matches[this.templaterState.tagStart.numXmlTag][2].indexOf('{')) === -1) {
        throw "no opening tag at @templaterState.tagStart.numXmlTag " + this.templaterState.matches[this.templaterState.tagStart.numXmlTag][2];
      }
      copyContent = content;
      if (this.templaterState.tagEnd.numXmlTag === this.templaterState.tagStart.numXmlTag) {
        insideValue = this.templaterState.matches[this.templaterState.tagStart.numXmlTag][2].replace("{" + this.templaterState.textInsideTag + "}", newValue);
        content = this.replaceXmlTag(content, {
          xmlTagNumber: this.templaterState.tagStart.numXmlTag,
          insideValue: insideValue,
          noStartTag: (this.templaterState.matches[this.templaterState.tagStart.numXmlTag].first != null) || (this.templaterState.matches[this.templaterState.tagStart.numXmlTag].last != null)
        });
      } else if (this.templaterState.tagEnd.numXmlTag > this.templaterState.tagStart.numXmlTag) {
        regexRight = /^([^{]*){.*$/;
        subMatches = this.templaterState.matches[this.templaterState.tagStart.numXmlTag][2].match(regexRight);
        if ((this.templaterState.matches[this.templaterState.tagStart.numXmlTag].first != null) || (this.templaterState.matches[this.templaterState.tagStart.numXmlTag].last != null)) {
          content = this.replaceXmlTag(content, {
            xmlTagNumber: this.templaterState.tagStart.numXmlTag,
            insideValue: newValue,
            noStartTag: this.templaterState.matches[this.templaterState.tagStart.numXmlTag].last != null
          });
        } else {
          content = this.replaceXmlTag(content, {
            xmlTagNumber: this.templaterState.tagStart.numXmlTag,
            insideValue: subMatches[1] + newValue
          });
        }
        for (k = _i = _ref = this.templaterState.tagStart.numXmlTag + 1, _ref1 = this.templaterState.tagEnd.numXmlTag; _ref <= _ref1 ? _i < _ref1 : _i > _ref1; k = _ref <= _ref1 ? ++_i : --_i) {
          this.templaterState.charactersAdded[k + 1] = this.templaterState.charactersAdded[k];
          content = this.replaceXmlTag(content, {
            xmlTagNumber: k,
            insideValue: "",
            spacePreserve: false
          });
        }
        regexLeft = /^[^}]*}(.*)$/;
        insideValue = this.templaterState.matches[this.templaterState.tagEnd.numXmlTag][2].replace(regexLeft, '$1');
        this.templaterState.charactersAdded[this.templaterState.tagEnd.numXmlTag + 1] = this.templaterState.charactersAdded[this.templaterState.tagEnd.numXmlTag];
        content = this.replaceXmlTag(content, {
          xmlTagNumber: k,
          insideValue: insideValue
        });
      }
      _ref2 = this.templaterState.matches;
      for (j = _j = 0, _len = _ref2.length; _j < _len; j = ++_j) {
        match = _ref2[j];
        if (j > this.templaterState.tagEnd.numXmlTag) {
          this.templaterState.charactersAdded[j + 1] = this.templaterState.charactersAdded[j];
        }
      }
      if (copyContent === content) {
        throw "copycontent=content !!";
      }
      return content;
    };


    /*
    	content is the whole content to be tagged
    	scope is the current scope
    	returns the new content of the tagged content
     */

    XmlTemplater.prototype.applyTags = function() {
      var character, innerText, m, match, numCharacter, numXmlTag, t, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      this.templaterState.initialize();
      _ref = this.templaterState.matches;
      for (numXmlTag = _i = 0, _len = _ref.length; _i < _len; numXmlTag = ++_i) {
        match = _ref[numXmlTag];
        innerText = match[2];
        for (numCharacter = _j = 0, _len1 = innerText.length; _j < _len1; numCharacter = ++_j) {
          character = innerText[numCharacter];
          this.templaterState.currentStep = {
            'numXmlTag': numXmlTag,
            'numCharacter': numCharacter
          };
          _ref1 = this.templaterState.matches;
          for (t = _k = 0, _len2 = _ref1.length; _k < _len2; t = ++_k) {
            m = _ref1[t];
            if (t <= numXmlTag) {
              if (this.content[m.offset + this.templaterState.charactersAdded[t]] !== m[0][0]) {
                throw "no < at the beginning of " + m[0][0] + " (2)";
              }
            }
          }
          if (character === '{') {
            this.templaterState.startTag();
          } else if (character === '}') {
            this.templaterState.endTag();
            if (this.templaterState.loopType() === 'simple') {
              this.replaceSimpleTag();
            }
            if (this.templaterState.textInsideTag[0] === '/' && ('/' + this.templaterState.loopOpen.tag === this.templaterState.textInsideTag)) {
              return this.replaceLoopTag();
            }
          } else {
            if (this.templaterState.inTag === true) {
              this.templaterState.textInsideTag += character;
            }
          }
        }
      }
      new ImgReplacer(this).findImages().replaceImages();
      return this;
    };

    XmlTemplater.prototype.handleRecursiveCase = function() {

      /*
      		Because xmlTemplater is recursive (meaning it can call it self), we need to handle special cases where the XML is not valid:
      		For example with this string "I am</w:t></w:r></w:p><w:p><w:r><w:t>sleeping",
      			- we need to match also the string that is inside an implicit <w:t> (that's the role of replacerUnshift) (in this case 'I am')
      			- we need to match the string that is at the right of a <w:t> (that's the role of replacerPush) (in this case 'sleeping')
      		the test: describe "scope calculation" it "should compute the scope between 2 <w:t>" makes sure that this part of code works
      		It should even work if they is no XML at all, for example if the code is just "I am sleeping", in this case however, they should only be one match
       */
      var regex, replacerPush, replacerUnshift;
      replacerUnshift = (function(_this) {
        return function() {
          var match, offset, pn, string, _i;
          match = arguments[0], pn = 4 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 2) : (_i = 1, []), offset = arguments[_i++], string = arguments[_i++];
          pn.unshift(match);
          pn.offset = offset;
          pn.first = true;
          _this.templaterState.matches.unshift(pn);
          return _this.templaterState.charactersAdded.unshift(0);
        };
      })(this);
      this.content.replace(/^()([^<]+)/, replacerUnshift);
      replacerPush = (function(_this) {
        return function() {
          var match, offset, pn, string, _i;
          match = arguments[0], pn = 4 <= arguments.length ? __slice.call(arguments, 1, _i = arguments.length - 2) : (_i = 1, []), offset = arguments[_i++], string = arguments[_i++];
          pn.unshift(match);
          pn.offset = offset;
          pn.last = true;
          _this.templaterState.matches.push(pn);
          return _this.templaterState.charactersAdded.push(0);
        };
      })(this);
      regex = "(<" + this.tagXml + "[^>]*>)([^>]+)$";
      return this.content.replace(new RegExp(regex), replacerPush);
    };

    XmlTemplater.prototype.useTag = function(tag) {
      var i, s, u, _i, _len, _ref;
      u = this.usedTags;
      _ref = this.scopePath;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        s = _ref[i];
        if (u[s] == null) {
          u[s] = {};
        }
        u = u[s];
      }
      if (tag !== "") {
        return u[tag] = true;
      }
    };

    XmlTemplater.prototype.calcIntellegentlyDashElement = function() {
      return false;
    };

    XmlTemplater.prototype.replaceSimpleTag = function() {
      return this.content = this.replaceTagByValue(this.getValueFromScope(this.templaterState.textInsideTag));
    };

    XmlTemplater.prototype.replaceLoopTag = function() {
      var dashElement;
      if (this.templaterState.loopType() === 'dash') {
        return this.dashLoop(this.templaterState.loopOpen.element);
      }
      if (this.intelligentTagging === true) {
        dashElement = this.calcIntellegentlyDashElement();
        if (dashElement !== false) {
          return this.dashLoop(dashElement, true);
        }
      }
      return this.forLoop();
    };

    XmlTemplater.prototype.calcSubXmlTemplater = function(innerTagsContent, scope) {
      var options, subfile;
      options = this.toJson();
      if (scope != null) {
        options.Tags = scope;
        options.scopePath = options.scopePath.concat(this.templaterState.loopOpen.tag);
      }
      subfile = new this.currentClass(innerTagsContent, options);
      subfile.applyTags();
      if ((subfile.getFullText().indexOf('{')) !== -1) {
        throw "they shouln't be a { in replaced file: " + (subfile.getFullText()) + " (1)";
      }
      this.imageId = subfile.imageId;
      return subfile;
    };

    return XmlTemplater;

  })();

  root.XmlTemplater = XmlTemplater;

}).call(this);

(function() {
  var DocXTemplater, env, root,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  root = typeof global !== "undefined" && global !== null ? global : window;

  env = typeof global !== "undefined" && global !== null ? 'node' : 'browser';

  DocXTemplater = DocXTemplater = (function(_super) {
    var xmlUtil;

    __extends(DocXTemplater, _super);

    xmlUtil = new XmlUtil();

    function DocXTemplater(content, options) {
      if (content == null) {
        content = "";
      }
      if (options == null) {
        options = {};
      }
      DocXTemplater.__super__.constructor.call(this, "", options);
      this.currentClass = DocXTemplater;
      this.tagXml = 'w:t';
      if (typeof content === "string") {
        this.load(content);
      } else {
        throw "content must be string!";
      }
    }

    DocXTemplater.prototype.calcIntellegentlyDashElement = function() {
      var content, end, scopeContent, start, t, _i, _len, _ref;
      _ref = this.findOuterTagsContent(), content = _ref.content, start = _ref.start, end = _ref.end;
      scopeContent = xmlUtil.getListXmlElements(this.content, start, end - start);
      for (_i = 0, _len = scopeContent.length; _i < _len; _i++) {
        t = scopeContent[_i];
        if (t.tag === '<w:tc>') {
          return 'w:tr';
        }
      }
      return DocXTemplater.__super__.calcIntellegentlyDashElement.call(this);
    };

    return DocXTemplater;

  })(XmlTemplater);

  root.DocXTemplater = DocXTemplater;

}).call(this);
