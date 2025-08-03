-- 创建 post-images bucket（如果不存在）
-- 注意：这个脚本需要在 Supabase Dashboard 的 Storage 部分手动执行
-- 或者通过 Supabase CLI 执行

-- 创建 bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- 设置 bucket 的公共访问策略
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'post-images');

-- 允许认证用户上传图片
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'post-images' 
  AND auth.role() = 'authenticated'
);

-- 允许用户删除自己上传的图片
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'post-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
); 