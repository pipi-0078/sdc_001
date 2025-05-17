document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('memoForm');
    const memoItems = document.getElementById('memoItems');

    // イベントリスナーをメモアイテムに設定
    memoItems.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        
        const index = target.dataset.index;
        if (!index) return;
        
        if (target.classList.contains('delete-btn')) {
            // メモを取得
            const memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            const memo = memos[index];
            
            if (!memo) {
                showNotification('メモが見つかりません', 'info');
                return;
            }

            // 削除確認ダイアログを1回だけ表示
            if (confirm(`「${memo.facilityName}」のメモを削除しますか？`)) {
                try {
                    // メモを削除
                    deleteMemo(index);
                } catch (error) {
                    console.error('削除エラー:', error);
                    showNotification('削除に失敗しました', 'danger');
                }
            }
        } else if (target.classList.contains('share-btn')) {
            shareMemo(index);
        } else if (target.classList.contains('share-line-btn')) {
            // LINEで共有
            try {
                const memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
                const memo = memos[index];
                
                if (!memo) {
                    showNotification('メモが見つかりません', 'info');
                    return;
                }

                const shareText = `
                    施設名: ${memo.facilityName}\n
                    入り方: ${memo.entryMethod}\n
                    出方: ${memo.exitMethod}\n
                    1階: ${memo.floors.floor1}\n
                    2階: ${memo.floors.floor2}\n
                    3階: ${memo.floors.floor3}\n
                    報告書の記入場所: ${memo.reportLocation}\n
                    キーパーソン: ${memo.keyPerson}\n
                    備考: ${memo.notes}\n
                    記録日時: ${new Date(memo.timestamp).toLocaleString()}`.trim();

                const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(shareText)}`;
                window.open(lineUrl, '_blank');
            } catch (error) {
                console.error('LINE共有エラー:', error);
                showNotification('LINEでの共有に失敗しました', 'danger');
            }
        } else if (target.classList.contains('share-airdrop-btn')) {
            // AirDropで共有
            try {
                const memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
                const memo = memos[index];
                
                if (!memo) {
                    showNotification('メモが見つかりません', 'info');
                    return;
                }

                const shareText = `
                    施設名: ${memo.facilityName}\n
                    入り方: ${memo.entryMethod}\n
                    出方: ${memo.exitMethod}\n
                    1階: ${memo.floors.floor1}\n
                    2階: ${memo.floors.floor2}\n
                    3階: ${memo.floors.floor3}\n
                    報告書の記入場所: ${memo.reportLocation}\n
                    キーパーソン: ${memo.keyPerson}\n
                    備考: ${memo.notes}\n
                    記録日時: ${new Date(memo.timestamp).toLocaleString()}`.trim();

                // AirDropの共有
                if (navigator.share) {
                    navigator.share({
                        title: `${memo.facilityName}の訪問メモ`,
                        text: shareText
                    }).catch(error => {
                        console.error('AirDrop共有エラー:', error);
                        showNotification('AirDropでの共有に失敗しました', 'warning');
                    });
                } else {
                    showNotification('AirDropはこのデバイスでは使用できません', 'info');
                }
            } catch (error) {
                console.error('AirDrop共有エラー:', error);
                showNotification('AirDropでの共有に失敗しました', 'danger');
            }
        }
    });

    // メモを共有する関数 - グローバルに利用できるように設定
    window.shareMemo = function(index) {
        try {
            // メモを取得
            const memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            const memo = memos[index];
            
            if (!memo) {
                showNotification('メモが見つかりません', 'info');
                return;
            }

            // メモの内容を整形
            const shareText = `
                施設名: ${memo.facilityName}\n
                入り方: ${memo.entryMethod}\n
                出方: ${memo.exitMethod}\n
                1階: ${memo.floors.floor1}\n
                2階: ${memo.floors.floor2}\n
                3階: ${memo.floors.floor3}\n
                報告書の記入場所: ${memo.reportLocation}\n
                キーパーソン: ${memo.keyPerson}\n
                備考: ${memo.notes}\n
                記録日時: ${new Date(memo.timestamp).toLocaleString()}`.trim();

            // ブラウザの共有APIを使用
            if (navigator.share) {
                navigator.share({
                    title: `${memo.facilityName}の訪問メモ`,
                    text: shareText
                }).catch(error => {
                    console.error('共有エラー:', error);
                    showNotification('共有を中断しました', 'warning');
                });
            } else {
                // 共有APIがサポートされていない場合のフォールバック
                const blob = new Blob([shareText], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${memo.facilityName}_訪問メモ.txt`;
                link.click();
                URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('共有エラー:', error);
            showNotification('共有に失敗しました', 'danger');
        }
    };

    // 通知表示機能
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        notification.style.zIndex = '9999';
        notification.innerHTML = `
            <strong>${message}</strong>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // 3秒後に自動的に消去
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // メモを保存する関数
    function saveMemo(memoData, index = null) {
        try {
            // デバッグログ
            console.log('保存するメモデータ:', memoData);
            
            // localStorageから既存のメモを取得
            let memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            
            if (index !== null) {
                // 編集モードの場合、既存のメモを更新
                memos[index] = memoData;
                showNotification('メモを更新しました', 'success');
            } else {
                // 新規作成モードの場合、新しいメモを追加
                memos.push(memoData);
                showNotification('メモを保存しました', 'success');
            }
            
            // localStorageに保存
            localStorage.setItem('facility_memos', JSON.stringify(memos));
            
            // デバッグログ
            console.log('保存されたメモ:', memos);
            
            // メモリストを更新
            updateMemoList();
        } catch (error) {
            console.error('保存エラー:', error);
            showNotification('メモの保存に失敗しました', 'danger');
        }
    }

    // メモを削除する関数 - グローバルに利用できるように設定
    window.deleteMemo = function(index) {
        try {
            // メモを取得して確認
            let memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            
            if (!memos[index]) {
                showNotification('削除するメモが見つかりません', 'warning');
                return;
            }
            
            // メモを削除
            memos.splice(index, 1);
            
            // localStorageに保存
            localStorage.setItem('facility_memos', JSON.stringify(memos));
            
            // メモリストを更新
            updateMemoList();
            
            showNotification('メモを削除しました', 'success');
        } catch (error) {
            console.error('削除エラー:', error);
            showNotification('メモの削除に失敗しました', 'danger');
        }
    };

    // メモリストの更新処理
    function updateMemoList() {
        try {
            // デバッグログ
            console.log('メモリストを更新します');
            
            // localStorageからメモを取得
            let memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            
            // デバッグログ
            console.log('取得したメモ:', memos);
            
            // メモが存在しない場合はメッセージを表示
            if (memos.length === 0) {
                memoItems.innerHTML = '<p class="text-muted">まだメモがありません</p>';
                return;
            }

            // メモを並び替え（新しいものから表示）
            memos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // メモをHTMLに変換
            const memoElements = memos.map((memo, index) => {
                return `
                    <div class="card mb-3">
                        <div class="card-body">
                            <h5 class="card-title">${memo.facilityName}</h5>
                            <p class="card-text">
                                <strong>入り方:</strong> ${memo.entryMethod}<br>
                                <strong>出方:</strong> ${memo.exitMethod}<br>
                                <strong>各階の詳細:</strong><br>
                                <div class="floor-details">
                                    <div class="floor-item">
                                        <strong>１階</strong><br>
                                        <small>${memo.floors.floor1}</small>
                                    </div>
                                    <div class="floor-item">
                                        <strong>２階</strong><br>
                                        <small>${memo.floors.floor2}</small>
                                    </div>
                                    <div class="floor-item">
                                        <strong>３階</strong><br>
                                        <small>${memo.floors.floor3}</small>
                                    </div>
                                </div><br>
                                <strong>報告書の記入場所:</strong><br>
                                <small>${memo.reportLocation}</small><br>
                                <strong>キーパーソン:</strong><br>
                                <small>${memo.keyPerson}</small><br>
                                <strong>備考:</strong> ${memo.notes}<br>
                                <small class="text-muted">記録日時: ${new Date(memo.timestamp).toLocaleString()}</small>
                            </p>
                            <div class="btn-group">
                                <button class="btn btn-info btn-sm" onclick="window.editMemo(${index})">
                                    <i class="fas fa-edit me-1"></i>編集
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="if (confirm('このメモを削除しますか？')) window.deleteMemo(${index})">
                                    <i class="fas fa-trash-alt me-1"></i>削除
                                </button>
                                <button class="btn btn-primary btn-sm" onclick="window.shareMemo(${index})">
                                    <i class="fas fa-share-alt me-1"></i>共有
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });

            // メモを表示エリアに追加
            memoItems.innerHTML = memoElements.join('');
        } catch (error) {
            console.error('メモリストの更新エラー:', error);
            showNotification('メモリストの更新に失敗しました', 'danger');
        }
    }

    // メモを編集する関数 - グローバルに利用できるように設定
    window.editMemo = function(index) {
        try {
            const memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            const memo = memos[index];
            
            if (!memo) {
                showNotification('編集するメモが見つかりません', 'warning');
                return;
            }
            
            // フォームの各フィールドに既存の値をセット
            document.getElementById('facilityName').value = memo.facilityName;
            document.getElementById('entryMethod').value = memo.entryMethod;
            document.getElementById('exitMethod').value = memo.exitMethod;
            document.getElementById('floor1Detail').value = memo.floors.floor1;
            document.getElementById('floor2Detail').value = memo.floors.floor2;
            document.getElementById('floor3Detail').value = memo.floors.floor3;
            document.getElementById('reportLocation').value = memo.reportLocation;
            document.getElementById('keyPerson').value = memo.keyPerson;
            document.getElementById('notes').value = memo.notes;
            
            // 編集モードを示すフラグと編集対象のインデックスを設定
            const form = document.getElementById('memoForm');
            form.dataset.editing = 'true';
            form.dataset.editIndex = index;
            
            // 保存ボタンのテキストを「更新」に変更
            const saveButton = form.querySelector('.save-button');
            saveButton.textContent = '更新';
            
            // フォームを表示
            form.classList.remove('hidden');
            
            // フォームの入力フィールドにフォーカスを当てる
            document.getElementById('facilityName').focus();
        } catch (error) {
            console.error('編集エラー:', error);
            showNotification('編集に失敗しました', 'danger');
        }
    };

    // ボタンのイベントリスナーを設定
    memoItems.addEventListener('click', (e) => {
        const target = e.target;
        const index = parseInt(target.dataset.index);
        
        if (target.classList.contains('edit-btn')) {
            editMemo(index);
        } else if (target.classList.contains('delete-btn')) {
            // メモの内容を取得
            const memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            const memo = memos[index];
            
            if (memo) {
                // 確認ダイアログを表示
                if (confirm(`「${memo.facilityName}」のメモを削除しますか？`)) {
                    window.deleteMemo(index);
                }
            }
        } else if (target.classList.contains('share-btn')) {
            shareMemo(index);
        }
    });

    // フォームの送信イベントリスナー
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // フォームデータを取得
        const memoData = {
            facilityName: document.getElementById('facilityName').value,
            entryMethod: document.getElementById('entryMethod').value,
            exitMethod: document.getElementById('exitMethod').value,
            floors: {
                floor1: document.getElementById('floor1Detail').value,
                floor2: document.getElementById('floor2Detail').value,
                floor3: document.getElementById('floor3Detail').value
            },
            reportLocation: document.getElementById('reportLocation').value,
            keyPerson: document.getElementById('keyPerson').value,
            notes: document.getElementById('notes').value,
            timestamp: new Date().toISOString()
        };

        // 編集モードかどうかを確認
        if (form.dataset.editing === 'true') {
            // 編集モードの場合、メモを更新
            const index = parseInt(form.dataset.editIndex);
            
            // メモを保存（編集モード）
            saveMemo(memoData, index);
            
            // 編集モードを解除
            form.dataset.editing = 'false';
            form.dataset.editIndex = '';
            
            // 保存ボタンのテキストを「保存」に戻す
            const saveButton = form.querySelector('.save-button');
            saveButton.textContent = '保存';
        } else {
            // 新規作成モードの場合、新しいメモを保存
            saveMemo(memoData);
        }

        // フォームをリセット
        form.reset();
        form.classList.add('hidden');
    });

    // メモをテキストファイルとしてエクスポート
    window.exportMemos = function() {
        try {
            // メモを取得
            const memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            
            if (memos.length === 0) {
                showNotification('エクスポートするメモがありません', 'info');
                return;
            }

            // メモをテキスト形式に変換
            const text = memos.map((memo, index) => {
                return `メモ ${index + 1}:
施設名: ${memo.facilityName}
入り方: ${memo.entryMethod}
出方: ${memo.exitMethod}
1階: ${memo.floors.floor1}
2階: ${memo.floors.floor2}
3階: ${memo.floors.floor3}
報告書の記入場所: ${memo.reportLocation}
キーパーソン: ${memo.keyPerson}
備考: ${memo.notes}
記録日時: ${new Date(memo.timestamp).toLocaleString()}

`;
            }).join('');

            // テキストファイルを作成
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'facility_memos.txt';
            link.click();
            URL.revokeObjectURL(url);
            
            showNotification('メモをエクスポートしました', 'success');
        } catch (error) {
            console.error('エクスポートエラー:', error);
            showNotification('エクスポートに失敗しました', 'danger');
        }
    };

    // 単一のメモをエクスポート
    window.exportSingleMemo = function(index) {
        try {
            // メモを取得
            const memos = JSON.parse(localStorage.getItem('facility_memos') || '[]');
            const memo = memos[index];
            
            if (!memo) {
                showNotification('メモが見つかりません', 'info');
                return;
            }

            // メモをテキスト形式に変換
            const text = `施設名: ${memo.facilityName}
入り方: ${memo.entryMethod}
出方: ${memo.exitMethod}
1階: ${memo.floors.floor1}
2階: ${memo.floors.floor2}
3階: ${memo.floors.floor3}
報告書の記入場所: ${memo.reportLocation}
キーパーソン: ${memo.keyPerson}
備考: ${memo.notes}
記録日時: ${new Date(memo.timestamp).toLocaleString()}`;

            // テキストファイルを作成
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${memo.facilityName}_memo.txt`;
            link.click();
            URL.revokeObjectURL(url);
            
            showNotification('メモをエクスポートしました', 'success');
        } catch (error) {
            console.error('エクスポートエラー:', error);
            showNotification('エクスポートに失敗しました', 'danger');
        }
    };

    // ページ読み込み時に保存済みのメモを表示
    updateMemoList();
});