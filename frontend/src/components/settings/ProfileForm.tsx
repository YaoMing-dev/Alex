"use client";

import { useState, ChangeEvent, FormEvent, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { nanoid } from 'nanoid';
import { isEqual } from 'lodash';
import { Loader2, User, Camera, X, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

// TÁI SỬ DỤNG COMPONENT CỦA DỰ ÁN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext"; // Thêm để lấy user từ context

// SỬ DỤNG BIẾN CÔNG KHAI
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

// URLs AVATAR MẪU - Sử dụng placeholder nếu Cloudinary chưa được cấu hình
const DEFAULT_AVATARS_URLS = CLOUDINARY_CLOUD_NAME ? [
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1761818581/default-1_pdkizs.jpg`,
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1761818581/default-2_t7bzsx.jpg`,
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1761818581/default-3_jj31er.jpg`,
    `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/v1761818581/default-4_tn4p9h.jpg`,
] : [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=default1',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=default2',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=default3',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=default4',
];

// Dữ liệu cho Level Selector
const LEVEL_OPTIONS = [
    { value: "Beginner", label: "Beginner", description: "Mục tiêu: Đạt 4.0 IELTS. Tập trung vào từ vựng cơ bản và ngữ pháp nền tảng." },
    { value: "Intermediate", label: "Intermediate", description: "Mục tiêu: Đạt 4.5 - 6.0 IELTS. Luyện tập kỹ năng đọc/nghe nâng cao và viết luận đơn giản." },
    { value: "Advanced", label: "Advanced", description: "Mục tiêu: Đạt 6.5+ IELTS. Nắm vững từ vựng học thuật, tư duy phản biện và viết luận chuyên sâu." },
];

interface Props {
    isOnboarding?: boolean;
}

// Hàm trích xuất Public ID từ URL Cloudinary
const getPublicIdFromUrl = (url: string): string | null => {
    if (!url || !url.includes(CLOUDINARY_CLOUD_NAME as string)) return null;
    try {
        const parts = url.split('/');
        const publicIdWithExt = parts.slice(7).join('/');
        const publicId = publicIdWithExt.split('.').slice(0, -1).join('.');
        return publicId.startsWith('eduaion/avatars/') ? publicId : null;
    } catch (e) {
        return null;
    }
};

// Component con: LEVEL SELECTION
const LevelSelector: React.FC<{ selected: string; onChange: (level: string) => void }> = ({ selected, onChange }) => (
    <div className="space-y-3">
        {LEVEL_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={cn(
                        "flex items-start p-4 w-full rounded-lg border transition-all duration-200 text-left",
                        "hover:bg-accent hover:border-primary/50",
                        isSelected
                            ? "bg-edu-light border-primary shadow-md text-primary"
                            : "bg-background border-border text-foreground/80"
                    )}
                >
                    <span className={cn(
                        "w-4 h-4 rounded-full border-2 mt-1 mr-3 flex-shrink-0",
                        isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"
                    )} />
                    <div>
                        <p className="font-semibold text-base flex items-center">
                            {option.label}
                            {isSelected && <CheckCircle className="h-4 w-4 ml-2 text-primary" />}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">{option.description}</p>
                    </div>
                </button>
            );
        })}
    </div>
);

// Component chính: PROFILE FORM
export default function ProfileForm({ isOnboarding = false }: Props) {
    const router = useRouter();
    const { toast } = useToast();
    const { user } = useAuth(); // Lấy user từ context thay prop

    // useRef cho input file
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State gốc
    const initialForm = useMemo(() => ({
        username: user?.username || '',
        avatar: user?.avatar || '',
        level: user?.level || '',
    }), [user]);

    const [form, setForm] = useState(initialForm);
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(form.avatar);

    const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

    // Đồng bộ khi user thay đổi
    useEffect(() => {
        setForm(initialForm);
        setPreviewUrl(initialForm.avatar);
    }, [initialForm]);

    // Cleanup URL object
    useEffect(() => {
        return () => {
            if (currentFileUrl) URL.revokeObjectURL(currentFileUrl);
        };
    }, [currentFileUrl]);

    const handleAvatarClick = () => {
        if (fileInputRef.current && !uploading) fileInputRef.current.click();
    };

    const isFormDirty = !isEqual(initialForm, form);

    const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);

        if (currentFileUrl) {
            URL.revokeObjectURL(currentFileUrl);
            setCurrentFileUrl(null);
        }

        const newPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(newPreviewUrl);
        setCurrentFileUrl(newPreviewUrl);

        const uniqueId = nanoid(10);
        const newPublicId = `eduaion/avatars/${user?.id}_${uniqueId}`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'eduaion_avatar');
        formData.append('public_id', newPublicId);

        try {
            const uploadRes = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            const data = await uploadRes.json();

            if (!uploadRes.ok || !data.secure_url) throw new Error(data.error?.message || 'Upload failed');

            setForm(prev => ({ ...prev, avatar: data.secure_url }));
            setPreviewUrl(data.secure_url);

            const oldUrl = initialForm.avatar;
            const oldPublicId = getPublicIdFromUrl(oldUrl);

            if (oldPublicId && !DEFAULT_AVATARS_URLS.includes(oldUrl)) {
                await fetch('/api/cloudinary/delete-avatar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ publicId: oldPublicId }),
                    credentials: 'include'
                });
            }

            toast({
                title: "Upload Thành công! ✨",
                description: "Ảnh đại diện mới đã được tải lên.",
                variant: "info",
                duration: 3000
            });
        } catch (err: any) {
            console.error('Lỗi Upload:', err);
            toast({
                title: "Upload Thất Bại 😥",
                description: err.message || "Lỗi tải ảnh. Thử lại.",
                variant: "destructive",
            });
            setPreviewUrl(initialForm.avatar);
            setForm(prev => ({ ...prev, avatar: initialForm.avatar }));
        } finally {
            setUploading(false);
            if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
            setCurrentFileUrl(null);
        }
    };

    const handleSelectDefaultAvatar = (src: string) => {
        setForm(prev => ({ ...prev, avatar: src }));
        setPreviewUrl(src);
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (uploading || !isFormDirty) {
            router.push('/dashboard');
            return;
        }

        if (!form.username || !form.level || (!form.avatar && isOnboarding)) {
            toast({
                title: "Thông tin chưa đầy đủ",
                description: "Vui lòng điền Tên và Trình độ.",
                variant: "warning",
            });
            return;
        }

        // Lấy CSRF
        const csrfRes = await fetch('/api/auth/csrf');
        const { csrfToken } = await csrfRes.json();

        const res = await fetch('/api/user/me', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'x-csrf-token': csrfToken,
            },
            body: JSON.stringify(form),
            credentials: 'include'
        });

        if (res.ok) {
            toast({
                title: isOnboarding ? "🎉 Thiết lập thành công!" : "✅ Cập nhật thành công",
                description: "Thông tin đã lưu.",
                action: <Button variant="ghost" onClick={() => router.push('/dashboard')}>Đến Dashboard</Button>
            });
            router.refresh();
            router.push('/dashboard');
        } else {
            const data = await res.json();
            toast({
                title: "Cập nhật thất bại 😥",
                description: data.message || "Lỗi hệ thống. Thử lại.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen py-10 px-4 flex justify-center items-center">
            <Card className="w-full max-w-2xl z-10 animate-fade-in-up">
                <CardHeader>
                    <CardTitle>
                        {isOnboarding ? '🚀 Thiết Lập Tài Khoản' : '⚙️ Cài Đặt Hồ Sơ Cá Nhân'}
                    </CardTitle>
                    <CardDescription>
                        {isOnboarding ? 'Hoàn tất hồ sơ để bắt đầu.' : 'Quản lý thông tin và trình độ.'}
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-8 pt-6">

                        {/* PHẦN 1: AVATAR & USERNAME */}
                        <div className="grid md:grid-cols-3 gap-6 items-center">

                            {/* Cột 1: Ảnh Avatar */}
                            <div className="flex flex-col items-center justify-center space-y-3 md:col-span-1">
                                <Label className="font-bold text-center">Ảnh đại diện</Label>

                                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary shadow-lg group">
                                    {previewUrl ? (
                                        <Image
                                            src={previewUrl}
                                            alt="Avatar Preview"
                                            fill
                                            sizes="128px"
                                            className="object-cover transition-opacity duration-300"
                                            unoptimized
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                                            <User size={48} />
                                        </div>
                                    )}

                                    <input
                                        id="avatar-upload"
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                    />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        {uploading ? (
                                            <Loader2 size={24} className="animate-spin text-white" />
                                        ) : (
                                            <Camera size={24} className="text-white" />
                                        )}
                                    </div>
                                </div>

                                {uploading && <p className="text-sm text-primary/80 flex items-center gap-1">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Đang tải lên...
                                </p>}
                            </div>

                            {/* Cột 2 & 3: Username */}
                            <div className="space-y-4 md:col-span-2 md:mt-0">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Tên người dùng</Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Nhập tên người dùng"
                                        value={form.username}
                                        onChange={e => setForm(prev => ({ ...prev, username: e.target.value }))}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Info className="h-3 w-3" /> Tên này sẽ hiển thị công khai.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PHẦN 2: AVATAR MẪU & XÓA */}
                        <div className="space-y-3 border-t pt-6">
                            <Label className="font-bold">Chọn Avatar Mẫu</Label>
                            <div className="flex gap-3 flex-wrap">
                                {form.avatar && !DEFAULT_AVATARS_URLS.includes(form.avatar) && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setForm(prev => ({ ...prev, avatar: '' }));
                                            setPreviewUrl(null);
                                        }}
                                        variant="destructive"
                                        size="icon"
                                        className="w-16 h-16 rounded-full border-2 border-destructive/50"
                                        aria-label="Remove current avatar"
                                    >
                                        <X size={24} />
                                    </Button>
                                )}

                                {DEFAULT_AVATARS_URLS.map(src => (
                                    <button
                                        key={src}
                                        type="button"
                                        onClick={() => handleSelectDefaultAvatar(src)}
                                        className={cn(
                                            "w-16 h-16 overflow-hidden rounded-full border-2 transition-all p-0.5 relative",
                                            form.avatar === src
                                                ? 'border-primary shadow-lg ring-2 ring-primary/50'
                                                : 'border-border hover:border-primary/50'
                                        )}
                                    >
                                        <Image
                                            src={src}
                                            alt="Default"
                                            width={64}
                                            height={64}
                                            className="w-full h-full object-cover rounded-full"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PHẦN 3: LEVEL SELECTION */}
                        <div className="space-y-4 border-t pt-6">
                            <Label className="font-bold">Trình độ học tập</Label>
                            <CardDescription>
                                Chọn trình độ để cá nhân hóa nội dung.
                            </CardDescription>
                            <LevelSelector
                                selected={form.level}
                                onChange={(level) => setForm(prev => ({ ...prev, level }))}
                            />
                        </div>

                    </CardContent>

                    <div className="flex justify-end items-center p-6 pt-0 gap-3 border-t">
                        {!isOnboarding && isFormDirty && (
                            <Button
                                type="button"
                                onClick={() => {
                                    if (window.confirm('Hủy thay đổi?')) {
                                        setForm(initialForm);
                                        setPreviewUrl(initialForm.avatar);
                                        toast({
                                            title: "Hủy bỏ",
                                            description: "Thay đổi đã hủy.",
                                            variant: "info",
                                        });
                                    }
                                }}
                                variant="outline"
                            >
                                Hủy bỏ
                            </Button>
                        )}

                        <Button
                            type="submit"
                            variant="edu-primary"
                            size="lg"
                            disabled={uploading || !isFormDirty}
                            className="w-48"
                        >
                            {uploading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : isOnboarding ? (
                                'Bắt đầu học ngay!'
                            ) : (
                                'Lưu thay đổi'
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}