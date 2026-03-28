import { useMemo, useRef, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function TextEditor() {
  const [value, setValue] = useState("");
  const quillRef = useRef(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

  return (
    <div style={{ padding: 20, maxWidth: 1000, margin: "0 auto" }}>
      <h2>Text Editor</h2>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={(content, delta, source, editor) => {
          setValue(content);

          console.log("content:", content);
          console.log("delta:", delta);
          console.log("source:", source);
          console.log("full document delta:", editor.getContents());
        }}
        modules={modules}
        formats={formats}
        placeholder="Start typing here..."
      />
    </div>
  );
}

export default TextEditor;