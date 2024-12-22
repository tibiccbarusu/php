import * as THREE from 'three';
import {
	OrbitControls
}
from 'three/addons/controls/OrbitControls.js';
import {
	OBJLoader
}
from 'three/addons/loaders/OBJLoader.js';

/*classList
Field
Execute
Camera
Light
Environment
Object
Event
*/

export class Field {
	constructor() {
		this.fields = {};
		this.animationFrames = {};
		this.intervals = {};
		this.timeouts = {};
	}

	// フィールド作成
	createField(name, size = {
		x: 50,
		y: 50
	}) {
		if (this.fields[name]) {
			throw new Error(`フィールド "${name}" は既に存在します。`);
		}
		this.fields[name] = {
			scene: new THREE.Scene(),
			camera: null,
			renderer: null,
			objects: {},
			controls: null,
			light: null,
			size,
			isRendering: false,
		};
		console.log(`フィールド "${name}" を作成しました (大きさ: ${size.x}x${size.y})。`);
	}

	// フィールド初期化
	initializeField(name) {
		const field = this.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		// カメラの設定
		field.camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);

		// 床の設定
		const floorGeometry = new THREE.PlaneGeometry(field.size.x, field.size.y);
		const floorMaterial = new THREE.MeshStandardMaterial({
			color: 0x333333,
			side: THREE.DoubleSide
		});
		const floor = new THREE.Mesh(floorGeometry, floorMaterial);
		floor.rotation.x = -Math.PI / 2;
		field.scene.add(floor);
		field.floor = floor; // 床をフィールドオブジェクトに保存
		console.log(`床の設定完了: サイズ(${field.size.x}, ${field.size.y}), 位置(${floor.position.x}, ${floor.position.y}, ${floor.position.z}), 回転(${floor.rotation.x}, ${floor.rotation.y}, ${floor.rotation.z})`);

		// スカイボックスの初期設定（床の色と同じカラーコードを使用）
		const initialColor = new THREE.Color(0x333333);
		const skyboxTexture = new THREE.CanvasTexture(this.createColorCanvas(
			initialColor));
		const skyboxMaterial = new THREE.MeshBasicMaterial({
			map: skyboxTexture,
			side: THREE.BackSide
		});
		const skyboxGeometry = new THREE.BoxGeometry(1000, 1000, 1000); // 大きなボックス
		const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
		field.scene.add(skybox);
		field.skybox = skybox; // スカイボックスをフィールドオブジェクトに保存

		// ライトの設定
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(10, 10, 10); // 初期位置
		field.scene.add(directionalLight);
		field.light = directionalLight; // ライトをフィールドオブジェクトに保存

		console.log(`フィールド "${name}" の初期設定が完了しました（床、スカイボックス、ライトを含む）。`);
	}

	// カラーコードからスカイボックスのテクスチャを生成する補助関数
	createColorCanvas(color) {
		const canvas = document.createElement('canvas');
		canvas.width = 1;
		canvas.height = 1;

		const context = canvas.getContext('2d');
		context.fillStyle = color.getStyle();
		context.fillRect(0, 0, canvas.width, canvas.height);

		return canvas;
	}

	// 指定したHTML要素内でフィールドレンダリング
	startRenderingField(name, elementName = null, elementId = null) {
		const field = this.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		// 指定されたHTML要素を取得
		const container = elementId ? document.getElementById(elementId) : document.querySelector(
			elementName);

		if (!container) {
			throw new Error(
				`指定されたHTML要素が見つかりません。elementName: "${elementName}", elementId: "${elementId}"`
			);
		}

		// レンダラーの設定
		field.renderer = new THREE.WebGLRenderer();
		field.renderer.setSize(container.clientWidth, container.clientHeight);
		container.appendChild(field.renderer.domElement);

		// カメラ設定
		field.camera.aspect = container.clientWidth / container.clientHeight;
		field.camera.updateProjectionMatrix();
		field.camera.position.set(0, 10, 30);

		field.controls = new OrbitControls(field.camera, field.renderer.domElement);
		field.controls.enableDamping = true;

		// レンダリングループ
		field.isRendering = true;
		const animate = () => {
			if (!field.isRendering) return;
			field.controls.update();
			field.renderer.render(field.scene, field.camera);
			this.animationFrames[name] = requestAnimationFrame(animate);
		};
		animate();

		console.log(
			`フィールド "${name}" を要素 "${elementId || elementName}" 内でレンダリングを開始しました。`);
	}

	// フィールドレンダリングを終了
	stopRenderingField(name) {
		const field = this.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		field.isRendering = false;

		// レンダラーのDOM要素を削除
		if (field.renderer && field.renderer.domElement) {
			field.renderer.domElement.remove();
		}

		cancelAnimationFrame(this.animationFrames[name]);
		console.log(`フィールド "${name}" のレンダリングを終了しました。`);
	}

	// フィールド削除
	deleteField(name) {
		const field = this.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		// DOM要素を削除
		if (field.renderer) {
			field.renderer.domElement.remove();
		}

		// メモリ解放
		delete this.fields[name];
		console.log(`フィールド "${name}" を削除しました。`);
	}
}

export class Execute {
	constructor(fieldManager) {
		this.fieldManager = fieldManager;
		this.textureLoader = new THREE.TextureLoader();
	}

	// 関数を指定間隔で実行
	executeAtInterval(name, callback, interval) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		this.fieldManager.intervals[name] = setInterval(callback, interval);
		console.log(`フィールド "${name}" で関数を ${interval}ms ごとに実行します。`);
	}

	// 関数を指定時間後に実行
	executeAfterDelay(name, callback, delay) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		this.fieldManager.timeouts[name] = setTimeout(callback, delay);
		console.log(`フィールド "${name}" で関数を ${delay}ms 後に実行します。`);
	}
}

export class Camera {
	constructor(fieldManager) {
		this.fieldManager = fieldManager;
		this.textureLoader = new THREE.TextureLoader();
	}

	// カメラの位置と回転を設定
	setCameraProperties(name, position, rotation) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		field.camera.position.set(position.x, position.y, position.z);
		field.camera.rotation.set(rotation.x, rotation.y, rotation.z);
		field.controls.update();

		console.log(
			`カメラの位置と回転を変更しました: 位置=${JSON.stringify(position)}, 回転=${JSON.stringify(rotation)}`
		);
	}

	// カメラを特定のオブジェクトに注視
	lookAtObject(name, objectName) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		const object = field.objects[objectName];
		if (!object) {
			throw new Error(`オブジェクト "${objectName}" が存在しません。`);
		}

		field.controls.target.copy(object.position);
		field.controls.update();
		console.log(`カメラがオブジェクト "${objectName}" を注視するように変更しました。`);
	}

	// カメラ制御の詳細設定
	setCameraControl(fieldName, options) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		if (!field.controls) {
			throw new Error(`フィールド "${fieldName}" にカメラコントロールが設定されていません。`);
		}

		const {
			enablePan, enableRotate, enableZoom
		} = options;

		// パン（平行移動）の制御
		if (enablePan !== undefined) {
			field.controls.enablePan = enablePan;
			console.log(
				`フィールド "${fieldName}" のパン操作を ${enablePan ? '有効' : '無効'} に設定しました。`);
		}

		// 視点（回転）の制御
		if (enableRotate !== undefined) {
			field.controls.enableRotate = enableRotate;
			console.log(
				`フィールド "${fieldName}" の回転操作を ${enableRotate ? '有効' : '無効'} に設定しました。`);
		}

		// ズームの制御
		if (enableZoom !== undefined) {
			field.controls.enableZoom = enableZoom;
			console.log(
				`フィールド "${fieldName}" のズーム操作を ${enableZoom ? '有効' : '無効'} に設定しました。`);
		}

		field.controls.update(); // 設定変更を反映
	}

	// カメラの位置と回転を取得
    getCameraProperties(fieldName) {
        const field = this.fieldManager.fields[fieldName];
        if (!field) {
            throw new Error(`フィールド "${fieldName}" が存在しません。`);
        }

        if (!field.camera) {
            throw new Error(`フィールド "${fieldName}" にカメラが設定されていません。`);
        }

        return {
            position: {
                x: field.camera.position.x,
                y: field.camera.position.y,
                z: field.camera.position.z,
            },
            rotation: {
                x: field.camera.rotation.x,
                y: field.camera.rotation.y,
                z: field.camera.rotation.z,
            },
        };
    }
}

export class Light {
	constructor(fieldManager) {
		this.fieldManager = fieldManager;
		this.textureLoader = new THREE.TextureLoader();
	}

	// 光源の設定を変更
	setDefaultLightProperties(name, {
		intensity, color, position
	}) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		if (!field.light) {
			throw new Error(`フィールド "${name}" に光源が設定されていません。`);
		}

		if (intensity !== undefined) field.light.intensity = intensity;
		if (color !== undefined) field.light.color.set(color);
		if (position !== undefined) field.light.position.set(position.x, position.y,
			position.z);

		console.log(
			`光源のデータを変更しました: 強さ=${intensity}, 色=${color}, 位置=${JSON.stringify(position)}`
		);
	}

	// フィールドにライトを追加する関数
	addLight(fieldName, lightName, lightType, lightData) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		if (field.objects && field.objects[lightName]) {
			throw new Error(`ライト "${lightName}" は既にフィールド "${fieldName}" に存在します。`);
		}

		let light;
		switch (lightType) {
			case 'AmbientLight':
				light = new THREE.AmbientLight(lightData.color || 0xffffff, lightData.intensity ||
					1);
				break;
			case 'DirectionalLight':
				light = new THREE.DirectionalLight(lightData.color || 0xffffff, lightData.intensity ||
					1);
				if (lightData.position) {
					light.position.set(lightData.position.x, lightData.position.y, lightData.position
						.z);
				}
				break;
			case 'PointLight':
				light = new THREE.PointLight(lightData.color || 0xffffff, lightData.intensity ||
					1, lightData.distance || 0, lightData.decay || 1);
				if (lightData.position) {
					light.position.set(lightData.position.x, lightData.position.y, lightData.position
						.z);
				}
				break;
			default:
				throw new Error(`ライトタイプ "${lightType}" はサポートされていません。`);
		}

		field.scene.add(light);
		field.objects[lightName] = light;

		console.log(
			`フィールド "${fieldName}" にライト "${lightName}" (タイプ: ${lightType}) を追加しました。`);
	}

	// フィールドからライトを削除する関数
	removeLight(fieldName, lightName) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		const light = field.objects[lightName];
		if (!light || !(light instanceof THREE.Light)) {
			throw new Error(`ライト "${lightName}" はフィールド "${fieldName}" に存在しません。`);
		}

		field.scene.remove(light);
		delete field.objects[lightName];

		console.log(`フィールド "${fieldName}" からライト "${lightName}" を削除しました。`);
	}

	// フィールドに追加されたライトのデータを変更する関数
	setLightProperties(fieldName, lightName, properties) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		const light = field.objects[lightName];
		if (!light || !(light instanceof THREE.Light)) {
			throw new Error(`ライト "${lightName}" はフィールド "${fieldName}" に存在しません。`);
		}

		// プロパティの更新
		if (properties.color !== undefined) {
			light.color.set(properties.color);
		}
		if (properties.intensity !== undefined) {
			light.intensity = properties.intensity;
		}
		if (light.isPointLight || light.isDirectionalLight) {
			if (properties.position !== undefined) {
				light.position.set(properties.position.x || 0, properties.position.y || 0,
					properties.position.z || 0);
			}
		}
		if (light.isPointLight) {
			if (properties.distance !== undefined) {
				light.distance = properties.distance;
			}
			if (properties.decay !== undefined) {
				light.decay = properties.decay;
			}
		}

		console.log(`フィールド "${fieldName}" のライト "${lightName}" のプロパティを更新しました:`,
			properties);
	}

	// 引数で指定された名前のライトのデータを返す関数
	getLightProperties(fieldName, lightName) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}
		const light = field.objects[lightName];
		if (!light || !(light instanceof THREE.Light)) {
			throw new Error(`ライト "${lightName}" はフィールド "${fieldName}" に存在しません。`);
		}
		return {
			position: light.position.clone(),
			rotation: light.rotation ? light.rotation.clone() : null,
			intensity: light.intensity,
		};
	}

	// デフォルトのライトのデータを返す関数
	getDefaultLightProperties(fieldName) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}
		const light = field.light;
		if (!light) {
			throw new Error(`フィールド "${fieldName}" にデフォルトのライトが存在しません。`);
		}
		return {
			position: light.position.clone(),
			rotation: light.rotation ? light.rotation.clone() : null,
			scale: light.scale ? light.scale.clone() : null,
		};
	}
}

export class Environment {
	constructor(fieldManager) {
		this.fieldManager = fieldManager;
		this.textureLoader = new THREE.TextureLoader();
	}

	// 床のテクスチャを変更する関数
	setFieldFloorTexture(name, materialInput) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		if (!field.floor) {
			throw new Error(`フィールド "${name}" に床が存在しません。`);
		}

		if (typeof materialInput === 'string' && (materialInput.endsWith('.jpg') ||
				materialInput.endsWith('.png'))) {
			// テクスチャファイルを使用
			const texture = new THREE.TextureLoader().load(materialInput, () => {
				console.log(`床に画像テクスチャ "${materialInput}" を適用しました。`);
			});
			field.floor.material.map = texture;
			field.floor.material.needsUpdate = true;
		} else if (typeof materialInput === 'string' || typeof materialInput ===
			'number') {
			// カラーコードを使用
			const color = new THREE.Color(materialInput);
			field.floor.material.map = null; // 既存のテクスチャを無効化
			field.floor.material.color = color;
			field.floor.material.needsUpdate = true;

			console.log(`床にカラーコード "${materialInput}" を適用しました。`);
		} else {
			throw new Error(`無効な素材入力です: ${materialInput}`);
		}
	}

	// 床の表示/非表示を切り替える関数
	toggleFieldFloorVisibility(name, isVisible) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		if (!field.floor) {
			throw new Error(`フィールド "${name}" に床が存在しません。`);
		}

		field.floor.visible = isVisible;
		console.log(`フィールド "${name}" の床を${isVisible ? '表示' : '非表示'}に設定しました。`);
	}

	// フィールドのスカイボックスを変更する関数
	setFieldEnvironmentTexture(name, materialInput) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		if (Array.isArray(materialInput) && materialInput.length === 6) {
			// 6面のスカイボックステクスチャをロード
			const loader = new THREE.CubeTextureLoader();
			const cubeTexture = loader.load(materialInput);
			cubeTexture.format = THREE.RGBFormat;

			field.skybox.material = new THREE.MeshBasicMaterial({
				envMap: cubeTexture,
				side: THREE.BackSide
			});

			console.log(`フィールド "${name}" のスカイボックスを6面テクスチャで更新しました。`);
		} else if (typeof materialInput === 'string' && (materialInput.endsWith(
				'.jpg') || materialInput.endsWith('.png'))) {
			// 単一のテクスチャファイルを使用
			const texture = new THREE.TextureLoader().load(materialInput);
			field.skybox.material.map = texture;
			field.skybox.material.needsUpdate = true;

			console.log(`フィールド "${name}" のスカイボックスを単一テクスチャで更新しました。`);
		} else if (typeof materialInput === 'string' || typeof materialInput ===
			'number') {
			// カラーコードを使用
			const color = new THREE.Color(materialInput);
			const texture = new THREE.CanvasTexture(this.fieldManager.createColorCanvas(color));//修正
			field.skybox.material.map = texture;
			field.skybox.material.needsUpdate = true;

			console.log(`フィールド "${name}" のスカイボックスをカラーコードで更新しました。`);
		} else {
			throw new Error(`無効な素材入力です: ${materialInput}`);
		}
	}

	// スカイボックスの表示/非表示を切り替える関数
	toggleFieldEnvironmentVisibility(name, isVisible) {
		const field = this.fieldManager.fields[name];
		if (!field) {
			throw new Error(`フィールド "${name}" が存在しません。`);
		}

		if (field.skybox) {
			field.skybox.visible = isVisible;
			console.log(`フィールド "${name}" のスカイボックスを${isVisible ? '表示' : '非表示'}に設定しました。`);
		} else {
			throw new Error(`フィールド "${name}" にスカイボックスが存在しません。`);
		}
	}
}

// オブジェクト管理クラス
export class Object {
	constructor(fieldManager) {
		this.fieldManager = fieldManager;
		this.textureLoader = new THREE.TextureLoader();
	}

	// 通常オブジェクト作成
	async createObject(fieldName, objectName, type, size, materialInput) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}
		if (field.objects[objectName]) {
			throw new Error(`オブジェクト "${objectName}" は既に存在します。`);
		}

		let geometry;
		switch (type) {
			case 'cube':
				geometry = new THREE.BoxGeometry(size, size, size);
				break;
			case 'sphere':
				geometry = new THREE.SphereGeometry(size, 32, 32);
				break;
			case 'plane':
				geometry = new THREE.PlaneGeometry(size.width, size.height);
				break;
			case 'circle':
				geometry = new THREE.CircleGeometry(size.radius, 32);
				break;
			case 'cylinder':
				geometry = new THREE.CylinderGeometry(size.radiusTop, size.radiusBottom,
					size.height, 32);
				break;
			case 'cone':
				geometry = new THREE.ConeGeometry(size.radius, size.height, 32);
				break;
			case 'torus':
				geometry = new THREE.TorusGeometry(size.radius, size.tube, 16, 100);
				break;
			default:
				throw new Error(`タイプ "${type}" はサポートされていません。`);
		}

		let material;
		if (typeof materialInput === 'string' && (materialInput.endsWith('.jpg') ||
				materialInput.endsWith('.png'))) {
			const texture = await this.textureLoader.loadAsync(materialInput);
			material = new THREE.MeshStandardMaterial({
				map: texture
			});
		} else {
			material = new THREE.MeshStandardMaterial({
				color: materialInput
			});
		}

		const object = new THREE.Mesh(geometry, material);
		field.scene.add(object);
		field.objects[objectName] = object;
		console.log(`オブジェクト "${objectName}" を作成しました。`);
	}

	// OBJオブジェクト作成
	async createOBJObject(fieldName, objectName, objFilePath, scale, materialInput) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}
		if (field.objects[objectName]) {
			throw new Error(`オブジェクト "${objectName}" は既に存在します。`);
		}

		const loader = new OBJLoader();
		const object = await loader.loadAsync(objFilePath);

		object.scale.set(scale, scale, scale);
		if (materialInput) {
			const material = new THREE.MeshStandardMaterial(
				typeof materialInput === 'string' && (materialInput.endsWith('.jpg') ||
					materialInput.endsWith('.png')) ? {
					map: await this.textureLoader.loadAsync(materialInput)
				} : {
					color: materialInput
				}
			);
			object.traverse((child) => {
				if (child.isMesh) {
					child.material = material;
				}
			});
		}

		field.scene.add(object);
		field.objects[objectName] = object;
		console.log(`OBJオブジェクト "${objectName}" を作成しました。`);
	}

	// オブジェクト削除
	deleteObject(fieldName, objectName) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		const object = field.objects[objectName];
		if (!object) {
			throw new Error(`オブジェクト "${objectName}" が存在しません。`);
		}

		field.scene.remove(object);
		delete field.objects[objectName];
		console.log(`オブジェクト "${objectName}" を削除しました。`);
	}

	// オブジェクトの位置、回転、およびスケールを変更
	setObjectProperties(fieldName, objectName, properties) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		const object = field.objects[objectName];
		if (!object) {
			throw new Error(`オブジェクト "${objectName}" が存在しません。`);
		}

		// 位置の設定
		if (properties.position) {
			object.position.set(
				properties.position.x || object.position.x,
				properties.position.y || object.position.y,
				properties.position.z || object.position.z
			);
		}

		// 回転の設定
		if (properties.rotation) {
			object.rotation.set(
				properties.rotation.x || object.rotation.x,
				properties.rotation.y || object.rotation.y,
				properties.rotation.z || object.rotation.z
			);
		}

		// スケールの設定
		if (properties.scale) {
			if (properties.scale.x !== undefined && properties.scale.y !== undefined &&
				properties.scale.z !== undefined) {
				object.scale.set(properties.scale.x, properties.scale.y, properties.scale.z);
			} else {
				throw new Error('スケールオブジェクトには x, y, z のすべてが必要です。');
			}
		}

		console.log(
			`オブジェクト "${objectName}" のプロパティを変更しました: ${JSON.stringify(properties)}`);
	}

	// Canvas UIオブジェクトを追加
	addCanvasUIObject(fieldName, objectName, width, height, drawCallback) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		if (field.objects[objectName]) {
			throw new Error(`オブジェクト "${objectName}" は既に存在します。`);
		}

		// canvas 要素を作成
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;

		const context = canvas.getContext('2d');
		if (!context) {
			throw new Error('canvas のコンテキストを取得できませんでした。');
		}

		// 描画用のコールバックを実行
		drawCallback(context, canvas);

		// canvas を Three.js のテクスチャに変換
		const texture = new THREE.CanvasTexture(canvas);
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			transparent: true
		});
		const geometry = new THREE.PlaneGeometry(width / 100, height / 100); // サイズ調整

		const plane = new THREE.Mesh(geometry, material);

		// 初期位置を設定
		plane.position.set(0, 0, 0);

		field.scene.add(plane);
		field.objects[objectName] = plane;

		console.log(`Canvas UIオブジェクト "${objectName}" をフィールド "${fieldName}" に追加しました。`);
	}

	// オブジェクトのテクスチャ表示箇所を反転する関数
	toggleObjectTextureVisibility(fieldName, objectName) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		const object = field.objects[objectName];
		if (!object) {
			throw new Error(`オブジェクト "${objectName}" が存在しません。`);
		}

		object.material.side =
			object.material.side === THREE.FrontSide ? THREE.BackSide : THREE.FrontSide;
		object.material.needsUpdate = true;

		console.log(`オブジェクト "${objectName}" のテクスチャ表示箇所を反転しました。`);
	}

	// オブジェクトのテクスチャを動画に変更する関数
	setObjectTextureToVideo(fieldName, objectName, videoUrl) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		const object = field.objects[objectName];
		if (!object) {
			throw new Error(`オブジェクト "${objectName}" が存在しません。`);
		}

		// 動画要素を作成
		const video = document.createElement('video');
		video.src = videoUrl;
		video.loop = true;
		video.muted = true;
		video.crossOrigin = 'anonymous'; // クロスオリジン対応
		video.autoplay = true;

		// 動画のロード確認後にテクスチャを設定
		video.addEventListener('canplay', () => {
			const videoTexture = new THREE.VideoTexture(video);
			videoTexture.minFilter = THREE.LinearFilter; // テクスチャのフィルタリング設定
			videoTexture.needsUpdate = true;

			// 動画テクスチャをオブジェクトに適用
			object.material = new THREE.MeshPhongMaterial({
				map: videoTexture
			});
			object.material.needsUpdate = true;

			console.log(`オブジェクト "${objectName}" に動画テクスチャを設定しました。`);
		});

		// 動画の再生開始
		video.play().catch((error) => {
			console.error('動画の再生に失敗しました:', error);
		});
	}

	// 指定されたオブジェクトの影の表示を設定する関数
	setObjectShadow(fieldName, objectName, castShadow, receiveShadow) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}

		const object = field.objects[objectName];
		if (!object || !(object instanceof THREE.Mesh)) {
			throw new Error(
				`オブジェクト "${objectName}" はフィールド "${fieldName}" に存在しないか、有効なメッシュではありません。`);
		}

		// 影の設定
		object.castShadow = castShadow !== undefined ? castShadow : object.castShadow;
		object.receiveShadow = receiveShadow !== undefined ? receiveShadow : object.receiveShadow;

		console.log(
			`フィールド "${fieldName}" のオブジェクト "${objectName}" の影を設定しました: castShadow=${object.castShadow}, receiveShadow=${object.receiveShadow}`
		);
	}

	// 引数で指定された名前のオブジェクトのデータを返す関数
	getObjectProperties(fieldName, objectName) {
		const field = this.fieldManager.fields[fieldName];
		if (!field) {
			throw new Error(`フィールド "${fieldName}" が存在しません。`);
		}
		const object = field.objects[objectName];
		if (!object) {
			throw new Error(`オブジェクト "${objectName}" はフィールド "${fieldName}" に存在しません。`);
		}
		return {
			position: object.position.clone(),
			rotation: object.rotation.clone(),
			scale: object.scale.clone(),
		};
	}
}

export class Event {
	constructor(fieldManager) {
		this.fieldManager = fieldManager;
		this.textureLoader = new THREE.TextureLoader();
	}

	// オブジェクトにクリックイベントを追加
	addClickEvent(fieldName, objectName, callback) {
        const field = this.fieldManager.fields[fieldName];
        if (!field) {
            throw new Error(`フィールド "${fieldName}" が存在しません。`);
        }
    
        const object = field.objects[objectName];
        if (!object) {
            throw new Error(`オブジェクト "${objectName}" が存在しません。`);
        }
    
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
    
        const onClick = (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, field.camera);
    
            const intersects = raycaster.intersectObject(object);
            if (intersects.length > 0) {
                callback();
            }
        };
    
        // イベントリスナーをオブジェクトに保存
        object._onClickListener = onClick;
    
        window.addEventListener('click', onClick);
        console.log(`オブジェクト "${objectName}" にクリックイベントを設定しました。`);
    }    

	// オブジェクトからクリックイベントを削除
	removeClickEvent(fieldName, objectName) {
        const field = this.fieldManager.fields[fieldName];
        if (!field) {
            throw new Error(`フィールド "${fieldName}" が存在しません。`);
        }
    
        const object = field.objects[objectName];
        if (!object) {
            throw new Error(`オブジェクト "${objectName}" が存在しません。`);
        }
    
        // オブジェクトに登録されているイベントリスナーを取得
        const onClick = object._onClickListener;
        if (!onClick) {
            throw new Error(`オブジェクト "${objectName}" にクリックイベントは登録されていません。`);
        }
    
        // イベントリスナーを削除
        window.removeEventListener('click', onClick);
    
        // リスナー情報をクリア
        delete object._onClickListener;
    
        console.log(`オブジェクト "${objectName}" からクリックイベントを削除しました。`);
    }    
}