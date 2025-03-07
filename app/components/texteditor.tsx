"use client";
import { FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify } from "react-icons/fa";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import TextAlign from "@tiptap/extension-text-align";
import Document from "@tiptap/extension-document";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Collaboration from "@tiptap/extension-collaboration";
import { WebrtcProvider } from "y-webrtc";
import * as Y from "yjs";
import { useState, useEffect } from "react";

function TextEditor() {
  const [roomName, setRoomName] = useState("");
  const [provider, setProvider] = useState<WebrtcProvider | null>(null);
  const [connectedUsers, setConnectedUsers] = useState<Map<number, any>>(new Map());
  const [ydoc] = useState(() => new Y.Doc());

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Document,
      Paragraph,
      Text,
      Heading,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ],
    content: "<p>Write here....</p>",
  });

  const handleConnect = () => {
    if (roomName && !provider) {
      console.log(`Attempting to connect to room: ${roomName}`);
      const newProvider = new WebrtcProvider(roomName, ydoc, {
        signaling: ["wss://signaling.yjs.dev"],
      });

      // Log connection status (fixed type)
      newProvider.on("status", ({ connected }: { connected: boolean }) => {
        console.log(`WebRTC Status: ${connected ? "Connected" : "Disconnected"}`);
      });

      // Set random user name and color
      const userName = `User${Math.floor(Math.random() * 1000)}`;
      newProvider.awareness.setLocalStateField("user", {
        name: userName,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      });
      console.log(`Local user set: ${userName}`);

      // Handle awareness updates
      newProvider.awareness.on("update", () => {
        const states = newProvider.awareness.getStates();
        console.log("Awareness updated. Connected users:", Array.from(states.entries()));
        setConnectedUsers(new Map(states));
        if (states.size > 0 && !provider) {
          alert(`Successfully connected to room: ${roomName}`);
        }
      });

      // Log Yjs document changes (for debugging collaboration)
      ydoc.on("update", (update: Uint8Array) => {
        console.log("Yjs document updated:", update);
      });

      setProvider(newProvider);
    }
  };

  const handleDisconnect = () => {
    if (provider) {
      console.log("Disconnecting from room:", roomName);
      provider.destroy();
      setProvider(null);
      setConnectedUsers(new Map());
      alert(`Disconnected from room: ${roomName}`);
    }
  };

  useEffect(() => {
    return () => {
      if (provider) {
        provider.destroy();
      }
    };
  }, [provider]);

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  return (
    <div className="w-1/2 h-[75vh] bg-gray-200">
      <div className="w-full h-1/6 bg-gray-400 flex flex-row">
        <div className="w-1/2 h-full">
          <div className="h-1/2 w-full bg-red-100 flex justify-evenly items-center">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`bold ${editor.isActive("bold") ? "buttons-active" : "buttons-inactive"}`}
            >
              B
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`italic ${editor.isActive("italic") ? "buttons-active" : "buttons-inactive"}`}
            >
              I
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`underline ${editor.isActive("underline") ? "buttons-active" : "buttons-inactive"}`}
            >
              U
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`line-through ${editor.isActive("strike") ? "buttons-active" : "buttons-inactive"}`}
            >
              S
            </button>
          </div>
          <div className="h-1/2 w-full bg-red-100 flex justify-evenly items-center">
            <button
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`${editor.isActive({ textAlign: "left" }) ? "buttons-active" : "buttons-inactive"}`}
            >
              <FaAlignLeft className={`${editor.isActive({ textAlign: "left" }) ? "text-white" : "text-black"}`} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={`${editor.isActive({ textAlign: "center" }) ? "buttons-active" : "buttons-inactive"}`}
            >
              <FaAlignCenter className={`${editor.isActive({ textAlign: "center" }) ? "text-white" : "text-black"}`} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`${editor.isActive({ textAlign: "right" }) ? "buttons-active" : "buttons-inactive"}`}
            >
              <FaAlignRight className={`${editor.isActive({ textAlign: "right" }) ? "text-white" : "text-black"}`} />
            </button>
            <button
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
              className={`${editor.isActive({ textAlign: "justify" }) ? "buttons-active" : "buttons-inactive"}`}
            >
              <FaAlignJustify className={`${editor.isActive({ textAlign: "justify" }) ? "text-white" : "text-black"}`} />
            </button>
          </div>
        </div>
        <div className="w-1/2 h-full">
          <div className="h-1/2 w-full flex justify-start items-center">
            <input
              type="text"
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-3/4 h-8 ps-2 text-black bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none m-2"
            />
            {!provider ? (
              <button
                onClick={handleConnect}
                className="h-8 w-1/4 me-2 bg-blue-400 rounded hover:bg-blue-500"
                disabled={!roomName}
              >
                Connect
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                className="h-8 w-1/4 me-2 bg-red-400 rounded hover:bg-red-500"
              >
                Disconnect
              </button>
            )}
          </div>
          <div className="h-1/2 w-full flex items-center px-2 overflow-y-auto">
            <div className="flex flex-wrap gap-2">
              {Array.from(connectedUsers.entries()).map(([clientId, state]) => (
                state.user && (
                  <div
                    key={clientId}
                    className="px-2 py-1 rounded text-sm text-white"
                    style={{ backgroundColor: state.user.color }}
                  >
                    {state.user.name}
                  </div>
                )
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-full h-5/6 text-black p-5">
        <EditorContent
          editor={editor}
          className="prose max-w-none w-full h-full text-xl leading-8 break-words whitespace-pre-wrap [&_*]:border-none [&_*]:outline-none"
        />
      </div>
    </div>
  );
}

export default TextEditor;