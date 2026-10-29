export interface VietnamBank {
  code: string; // Mã chuẩn VietQR.io (VD: VCB, MB, TCB...)
  shortName: string;
  fullName: string;
  bin: string;
}

export const VIETNAM_BANKS: VietnamBank[] = [
  { code: 'VCB', shortName: 'Vietcombank', fullName: 'Ngân hàng TMCP Ngoại thương Việt Nam', bin: '970436' },
  { code: 'MB', shortName: 'MB Bank', fullName: 'Ngân hàng TMCP Quân Đội', bin: '970422' },
  { code: 'TCB', shortName: 'Techcombank', fullName: 'Ngân hàng TMCP Kỹ thương Việt Nam', bin: '970407' },
  { code: 'ACB', shortName: 'ACB', fullName: 'Ngân hàng TMCP Á Châu', bin: '970416' },
  { code: 'ICB', shortName: 'VietinBank', fullName: 'Ngân hàng TMCP Công thương Việt Nam', bin: '970415' },
  { code: 'BIDV', shortName: 'BIDV', fullName: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam', bin: '970418' },
  { code: 'VBA', shortName: 'Agribank', fullName: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn VN', bin: '970405' },
  { code: 'TPB', shortName: 'TPBank', fullName: 'Ngân hàng TMCP Tiên Phong', bin: '970423' },
  { code: 'VPB', shortName: 'VPBank', fullName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng', bin: '970432' },
  { code: 'STB', shortName: 'Sacombank', fullName: 'Ngân hàng TMCP Sài Gòn Thương Tín', bin: '970403' },
  { code: 'VIB', shortName: 'VIB', fullName: 'Ngân hàng TMCP Quốc tế Việt Nam', bin: '970441' },
  { code: 'HDB', shortName: 'HDBank', fullName: 'Ngân hàng TMCP Phát triển TP.HCM', bin: '970437' },
  { code: 'OCB', shortName: 'OCB', fullName: 'Ngân hàng TMCP Phương Đông', bin: '970448' },
  { code: 'MSB', shortName: 'MSB', fullName: 'Ngân hàng TMCP Hàng Hải Việt Nam', bin: '970426' },
  { code: 'SHB', shortName: 'SHB', fullName: 'Ngân hàng TMCP Sài Gòn - Hà Nội', bin: '970443' },
  { code: 'LPB', shortName: 'LPBank', fullName: 'Ngân hàng TMCP Lộc Phát Việt Nam', bin: '970449' }
];

/**
 * Tự động nhận diện mã chuẩn VietQR từ mã ngân hàng hoặc tên ngân hàng
 */
export function resolveVietQrBankCode(bankCodeOrName?: string): string {
  if (!bankCodeOrName) return 'VCB';
  const clean = bankCodeOrName.trim().toUpperCase();
  const exact = VIETNAM_BANKS.find(
    (b) => b.code === clean || b.shortName.toUpperCase() === clean
  );
  if (exact) return exact.code;

  const partial = VIETNAM_BANKS.find(
    (b) =>
      clean.includes(b.code) ||
      clean.includes(b.shortName.toUpperCase()) ||
      b.shortName.toUpperCase().includes(clean)
  );
  return partial ? partial.code : 'VCB';
}

/**
 * Tạo đường dẫn ảnh mã QR Động chuẩn Napas 247 từ hệ thống VietQR.io
 * Khi quét bằng App Ngân hàng sẽ tự động điền đúng: Ngân hàng, Số TK, Số tiền (VNĐ) và Nội dung chuyển khoản
 */
export function buildVietQrUrl(params: {
  bankCodeOrName: string;
  accountNumber: string;
  accountHolder: string;
  amountVND: number;
  transferContent: string;
}): string {
  const bankCode = resolveVietQrBankCode(params.bankCodeOrName);
  const accNo = (params.accountNumber || '1029384756').replace(/\s+/g, '');
  const amount = Math.max(0, Math.round(params.amountVND));
  const addInfo = encodeURIComponent(params.transferContent.trim());
  const accName = encodeURIComponent((params.accountHolder || '').trim().toUpperCase());

  return `https://img.vietqr.io/image/${bankCode}-${accNo}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accName}`;
}
