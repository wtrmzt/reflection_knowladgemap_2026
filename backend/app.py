import pandas as pd
from flask import Response
from functools import wraps
# JWTトークンによる認証デコレータ（@admin_required等）が存在する前提

@app.route('/api/admin/export_csv', methods=['GET'])
# @admin_required  # 本番では必ず管理者権限チェックを入れる
def export_csv():
    try:
        # ※ User, Memo, MapHistory のモデルが既に定義されている前提
        # 研究分析のため、ユーザー情報、振り返りメモ、マップ履歴を結合して取得
        query = db.session.query(User, Memo, MapHistory)\
            .outerjoin(Memo, User.id == Memo.user_id)\
            .outerjoin(MapHistory, Memo.id == MapHistory.memo_id)
        
        data = []
        for user, memo, history in query.all():
            data.append({
                "user_id": user.id,
                "username": user.username,
                "memo_id": memo.id if memo else None,
                "memo_content": memo.content if memo else None,
                "history_id": history.id if history else None,
                "map_data": history.map_data if history else None,
                "created_at": history.created_at if history else None
            })
        
        # DataFrameに変換し、Excel等で文字化けしないようutf-8-sigで出力
        df = pd.DataFrame(data)
        csv_data = df.to_csv(index=False, encoding='utf-8-sig')
        
        return Response(
            csv_data,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename=knowledge_map_export.csv"}
        )
    except Exception as e:
        app.logger.error(f"CSV Export Error: {e}")
        return jsonify({"error": "Failed to export data"}), 500