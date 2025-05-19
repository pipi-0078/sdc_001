document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('facilityForm');
    const memoList = document.getElementById('memoList');
    
    // ローカルストレージから保存されたメモを読み込む
    const savedMemos = JSON.parse(localStorage.getItem('facilityMemos') || '[]');
    
    // 既存のメモを表示
    renderMemoList();
    
    // フォームの送信イベント
    form.addEventListener('submit', handleFormSubmit);

    // 編集モードフラグ
    let isEditMode = false;
    let editMemoId = null;

    // メモリストのイベントリスナー
    memoList.addEventListener('click', (e) => {
        const target = e.target;
        const memoItem = target.closest('.memo-item');
        
        // ボタンのdata-idを取得
        const memoId = parseInt(target.dataset.id);
        
        // メモアイテムが存在し、有効なIDが取得できた場合のみ処理を実行
        if (memoItem && !isNaN(memoId) && memoId >= 0 && memoId < savedMemos.length) {
            const memo = savedMemos[memoId];

            if (target.classList.contains('edit-btn')) {
                // 編集ボタンがクリックされた場合
                // フォームに値をセット
                document.getElementById('facilityName').value = memo.facilityName;
                document.getElementById('entrance').value = memo.entrance;
                document.getElementById('exit').value = memo.exit;
                document.getElementById('floor1').value = memo.floor1;
                document.getElementById('floor2').value = memo.floor2;
                document.getElementById('floor3').value = memo.floor3;
                document.getElementById('reportLocation').value = memo.reportLocation;
                document.getElementById('keyPerson').value = memo.keyPerson;
                document.getElementById('notes').value = memo.notes;

                // 編集モードを有効にする
                isEditMode = true;
                editMemoId = memoId;
            } else if (target.classList.contains('delete-btn')) {
                // 削除ボタンがクリックされた場合
                if (confirm('このメモを削除しますか？')) {
                    // メモを削除
                    savedMemos.splice(memoId, 1);
                    localStorage.setItem('facilityMemos', JSON.stringify(savedMemos));
                    
                    // メモリストを再描画
                    renderMemoList();
                }
            } else if (target.classList.contains('share-btn')) {
                // 共有ボタンがクリックされた場合
                // メモの内容をテキスト形式に変換
                const memoText = `施設名: ${memo.facilityName}\n
入り方: ${memo.entrance}\n
出方: ${memo.exit}\n
1階: ${memo.floor1}\n
2階: ${memo.floor2}\n
3階: ${memo.floor3}\n
報告書の場所: ${memo.reportLocation}\n
キーパーソン: ${memo.keyPerson}\n
備考: ${memo.notes}\n
保存日時: ${memo.timestamp}`;

                try {
                    // ネイティブの共有機能を使用
                    navigator.share({
                        title: memo.facilityName,
                        text: memoText
                    });
                } catch (error) {
                    // 共有機能が利用できない場合、テキストをコピー
                    navigator.clipboard.writeText(memoText).then(() => {
                        alert('メモの内容をクリップボードにコピーしました');
                    }).catch(() => {
                        alert('共有機能が利用できません');
                    });
                }
            }
        }
    });

    // フォームの送信処理
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // 入力値を取得
        const facilityName = document.getElementById('facilityName').value;
        const entrance = document.getElementById('entrance').value;
        const exit = document.getElementById('exit').value;
        const floor1 = document.getElementById('floor1').value;
        const floor2 = document.getElementById('floor2').value;
        const floor3 = document.getElementById('floor3').value;
        const reportLocation = document.getElementById('reportLocation').value;
        const keyPerson = document.getElementById('keyPerson').value;
        const notes = document.getElementById('notes').value;

        // 編集モードの場合は既存のメモを更新
        if (isEditMode && editMemoId !== null) {
            const updatedMemo = {
                facilityName,
                entrance,
                exit,
                floor1,
                floor2,
                floor3,
                reportLocation,
                keyPerson,
                notes,
                timestamp: new Date().toLocaleString()
            };

            // メモを更新
            savedMemos[editMemoId] = updatedMemo;
            localStorage.setItem('facilityMemos', JSON.stringify(savedMemos));

            // 編集モードを解除
            isEditMode = false;
            editMemoId = null;
        } else {
            // 新規メモの場合は追加
            const memo = {
                facilityName,
                entrance,
                exit,
                floor1,
                floor2,
                floor3,
                reportLocation,
                keyPerson,
                notes,
                timestamp: new Date().toLocaleString()
            };

            // メモをローカルストレージに保存
            savedMemos.push(memo);
            localStorage.setItem('facilityMemos', JSON.stringify(savedMemos));
        }

        // フォームをリセット
        form.reset();
        
        // メモリストを再描画
        renderMemoList();
    }

    // メモリストの再描画処理
    function renderMemoList() {
        // メモリストをクリア
        memoList.innerHTML = '';
        
        // 保存されたメモを表示
        savedMemos.forEach((memo, index) => {
            displayMemo(memo, index);
        });
    }

    // メモの表示処理
    function displayMemo(memo, index) {
        const memoItem = document.createElement('div');
        memoItem.className = 'memo-item';
        
        memoItem.innerHTML = `
            <h3>${memo.facilityName}</h3>
            <p><strong>入り方:</strong> ${memo.entrance}</p>
            <p><strong>出方:</strong> ${memo.exit}</p>
            <p><strong>1階:</strong> ${memo.floor1}</p>
            <p><strong>2階:</strong> ${memo.floor2}</p>
            <p><strong>3階:</strong> ${memo.floor3}</p>
            <p><strong>報告書の場所:</strong> ${memo.reportLocation}</p>
            <p><strong>キーパーソン:</strong> ${memo.keyPerson}</p>
            <p><strong>備考:</strong> ${memo.notes}</p>
            <p><strong>保存日時:</strong> ${memo.timestamp}</p>
            <div class="memo-actions">
                <button type="button" class="edit-btn" data-id="${index}">編集</button>
                <button type="button" class="delete-btn" data-id="${index}">削除</button>
                <button type="button" class="share-btn" data-id="${index}">共有</button>
            </div>
        `;

        memoList.appendChild(memoItem);
    }
});