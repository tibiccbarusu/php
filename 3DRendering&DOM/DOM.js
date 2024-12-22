export class DOM {
    // 親要素を追加するメソッド
    addParentElement(tag, id = '', className = '') {
        if (!tag) {
            throw new Error("タグは必須です。");
        }
        const element = document.createElement(tag);
        if (id) element.id = id;
        if (className) element.className = className;
        document.body.appendChild(element);
        return element;
    }

    // 子要素を親要素に追加するメソッド
    addChildToParent(parentTag, parentId = '', parentClass = '', childTag, childId = '', childClass = '') {
        if (!parentId && !parentClass) {
            throw new Error("親要素にはIDまたはclassが少なくとも一つ必要です。");
        }
        if (!childTag) {
            throw new Error("子要素のタグは必須です。");
        }
        const parents = [...document.querySelectorAll(`${parentTag}${parentId ? `#${parentId}` : ''}${parentClass ? `.${parentClass}` : ''}`)];
        if (parents.length === 0) {
            throw new Error("指定された親要素が見つかりません。");
        }
        parents.forEach(parent => {
            const child = document.createElement(childTag);
            if (childId) child.id = childId;
            if (childClass) child.className = childClass;
            parent.appendChild(child);
        });
    }

    // HTML要素にデータを追加するメソッド
    addDataToElement(tag, id, data) {
        if (!id) {
            throw new Error("IDは必須です。");
        }
        const element = document.querySelector(`${tag}#${id}`);
        if (!element) {
            throw new Error("指定された要素が見つかりません。");
        }
        element.textContent = data;
    }

    // HTML要素を削除するメソッド
    removeElements(tag, id = '', className = '') {
        const elements = [...document.querySelectorAll(`${tag}${id ? `#${id}` : ''}${className ? `.${className}` : ''}`)];
        if (elements.length === 0) {
            throw new Error("指定された要素が見つかりません。");
        }
        elements.forEach(element => element.remove());
    }

    // HTML要素のデータを取得するメソッド
    getElementData(tag, id) {
        if (!id) {
            throw new Error("IDは必須です。");
        }
        const element = document.querySelector(`${tag}#${id}`);
        if (!element) {
            throw new Error("指定された要素が見つかりません。");
        }
        return element.textContent;
    }

    // HTML要素にイベントを追加するメソッド
    addEventToElement(tag, id, event, callback) {
        if (!id) {
            throw new Error("IDは必須です。");
        }
        if (!event || typeof callback !== 'function') {
            throw new Error("有効なイベントとコールバック関数を指定してください。");
        }
        const element = document.querySelector(`${tag}#${id}`);
        if (!element) {
            throw new Error("指定された要素が見つかりません。");
        }
        element.addEventListener(event, callback);
    }

	onKeyPress(key, callback) {
		if (typeof key !== 'string' || typeof callback !== 'function') {
			throw new Error("Invalid arguments: expected a string key and a callback function");
		}
	
		document.addEventListener('keydown', (event) => {
			if (event.key === key) {
				callback();
			}
		});
	}
}