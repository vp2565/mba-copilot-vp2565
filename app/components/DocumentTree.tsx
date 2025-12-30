'use client';

import { Check, ChevronDown, ChevronRight, FileText, Folder, FolderOpen, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Document } from '../types';

interface DocumentTreeProps {
  documents: Document[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

interface TreeNode {
  name: string;
  path: string;
  type: 'folder' | 'file';
  document?: Document;
  children: TreeNode[];
  documentIds: string[]; // All document IDs in this folder and subfolders
}

export default function DocumentTree({
  documents,
  selectedIds,
  onSelectionChange,
  onDelete,
}: DocumentTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));

  // Build tree structure from flat document list
  const tree = useMemo(() => {
    const root: TreeNode = {
      name: 'My Documents',
      path: 'root',
      type: 'folder',
      children: [],
      documentIds: [],
    };

    documents.forEach((doc) => {
      const parts = doc.filename.split('/');
      let currentNode = root;

      // Navigate/create folder structure
      for (let i = 0; i < parts.length - 1; i++) {
        const folderName = parts[i];
        const folderPath = parts.slice(0, i + 1).join('/');

        let folderNode = currentNode.children.find(
          (child) => child.type === 'folder' && child.name === folderName
        );

        if (!folderNode) {
          folderNode = {
            name: folderName,
            path: folderPath,
            type: 'folder',
            children: [],
            documentIds: [],
          };
          currentNode.children.push(folderNode);
        }

        currentNode = folderNode;
      }

      // Add file
      const fileName = parts[parts.length - 1];
      currentNode.children.push({
        name: fileName,
        path: doc.filename,
        type: 'file',
        document: doc,
        children: [],
        documentIds: [doc.id],
      });
    });

    // Recursively collect document IDs for each folder
    const collectDocumentIds = (node: TreeNode): string[] => {
      if (node.type === 'file') {
        return node.documentIds;
      }
      const ids = node.children.flatMap((child) => collectDocumentIds(child));
      node.documentIds = ids;
      return ids;
    };

    collectDocumentIds(root);

    // Sort: folders first, then files, alphabetically
    const sortChildren = (node: TreeNode) => {
      node.children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortChildren);
    };
    sortChildren(root);

    return root;
  }, [documents]);

  const toggleDocument = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const toggleFolderSelection = (node: TreeNode) => {
    const folderDocIds = node.documentIds;
    const allFolderSelected = folderDocIds.every((id) => selectedIds.includes(id));

    if (allFolderSelected) {
      // Deselect all docs in this folder
      onSelectionChange(selectedIds.filter((id) => !folderDocIds.includes(id)));
    } else {
      // Select all docs in this folder
      const newSelection = new Set([...selectedIds, ...folderDocIds]);
      onSelectionChange(Array.from(newSelection));
    }
  };

  const deleteFolder = async (node: TreeNode) => {
    const folderName = node.path.split('/').pop() || node.name;
    const docCount = node.documentIds.length;

    if (!confirm(`Delete folder "${folderName}" and all ${docCount} document${docCount !== 1 ? 's' : ''} inside?`)) {
      return;
    }

    // Delete all documents in this folder in parallel
    await Promise.all(node.documentIds.map((id) => onDelete(id)));
  };

  const renderNode = (node: TreeNode, depth: number = 0) => {
    if (node.type === 'file' && node.document) {
      const isSelected = selectedIds.includes(node.document.id);
      const paddingLeft = `${(depth + 1) * 1.5 + 2.25}rem`; // 1.5rem per level + base padding

      return (
        <div
          key={node.path}
          className={`flex items-center gap-2.5 px-3 py-2.5 hover:bg-columbia-50 group transition-colors ${
            isSelected ? 'bg-blue-50/50' : 'bg-white'
          }`}
          style={{ paddingLeft }}
        >
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
              isSelected
                ? 'bg-columbia-600 border-columbia-600 shadow-sm'
                : 'border-slate-400 hover:border-columbia-500 hover:shadow-sm'
            }`}
            onClick={() => toggleDocument(node.document!.id)}
          >
            {isSelected && <Check className="w-3.5 h-3.5 text-white font-bold" />}
          </div>
          <FileText className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-columbia-600' : 'text-slate-500'}`} />
          <div className="flex-1 min-w-0" title={`${node.document.filename}\n${node.document.chunks} chunk${node.document.chunks !== 1 ? 's' : ''}`}>
            <p
              className={`text-sm truncate cursor-pointer hover:text-columbia-600 transition-colors font-medium ${
                isSelected ? 'text-slate-800' : 'text-slate-700'
              }`}
              onClick={() => toggleDocument(node.document!.id)}
            >
              {node.name}
            </p>
            <p className="text-xs text-slate-500 font-medium truncate">
              {node.document.chunks} chunk{node.document.chunks !== 1 ? 's' : ''} • {node.document.filename}
            </p>
          </div>
          <button
            onClick={() => onDelete(node.document!.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
            title="Delete document"
          >
            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
          </button>
        </div>
      );
    }

    if (node.type === 'folder') {
      const isExpanded = expandedFolders.has(node.path);
      const folderDocIds = node.documentIds;
      const allFolderSelected = folderDocIds.length > 0 && folderDocIds.every((id) => selectedIds.includes(id));
      const someFolderSelected = folderDocIds.some((id) => selectedIds.includes(id)) && !allFolderSelected;
      const paddingLeft = depth === 0 ? '0.75rem' : `${depth * 1.5 + 0.75}rem`;
      const isRoot = node.path === 'root';

      return (
        <div key={node.path}>
          <div
            className={`flex items-center gap-2 px-3 py-2.5 hover:bg-columbia-50 cursor-pointer group transition-colors ${
              isRoot ? 'bg-gradient-to-r from-columbia-50 to-columbia-100 border-b-2 border-columbia-200' : 'bg-white'
            }`}
            style={{ paddingLeft: isRoot ? '0.75rem' : paddingLeft }}
          >
            <div
              className="flex items-center gap-2 flex-1"
              onClick={() => toggleFolder(node.path)}
            >
              {isExpanded ? (
                <ChevronDown className={`w-4 h-4 ${isRoot ? 'text-columbia-700' : 'text-slate-600'}`} />
              ) : (
                <ChevronRight className={`w-4 h-4 ${isRoot ? 'text-columbia-700' : 'text-slate-600'}`} />
              )}
              {isExpanded ? (
                <FolderOpen className={`w-${isRoot ? '5' : '4'} h-${isRoot ? '5' : '4'} ${isRoot ? 'text-columbia-600' : 'text-amber-500'}`} />
              ) : (
                <Folder className={`w-${isRoot ? '5' : '4'} h-${isRoot ? '5' : '4'} ${isRoot ? 'text-columbia-600' : 'text-amber-500'}`} />
              )}
              <span className={`${isRoot ? 'text-sm font-semibold text-slate-800' : 'text-sm font-medium text-slate-700'} flex-1`}>
                {node.name}
              </span>
              <span className={`text-xs font-medium ${isRoot ? 'text-columbia-700 bg-white px-2 py-0.5 rounded-full' : 'text-slate-500'}`}>
                {folderDocIds.length}
              </span>
            </div>
            {!isRoot && (
              <>
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-all opacity-0 group-hover:opacity-100 ${
                    allFolderSelected
                      ? 'bg-columbia-600 border-columbia-600 shadow-sm opacity-100'
                      : someFolderSelected
                      ? 'bg-columbia-300 border-columbia-500 shadow-sm opacity-100'
                      : 'border-slate-400 hover:border-columbia-500 hover:shadow-sm'
                  }`}
                  onClick={() => toggleFolderSelection(node)}
                  title={allFolderSelected ? 'Deselect folder' : 'Select folder'}
                >
                  {(allFolderSelected || someFolderSelected) && (
                    <Check className="w-3.5 h-3.5 text-white font-bold" />
                  )}
                </div>
                <button
                  onClick={() => deleteFolder(node)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 rounded transition-all"
                  title="Delete folder"
                >
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                </button>
              </>
            )}
          </div>
          {isExpanded && (
            <div className="divide-y divide-slate-100">
              {node.children.map((child) => renderNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="border-2 border-slate-300 rounded-lg overflow-hidden shadow-sm">
      {renderNode(tree, 0)}
    </div>
  );
}
