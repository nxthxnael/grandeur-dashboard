import { Response } from 'express';

export function setAuthCookies(
  response: Response,
  tokens: { accessToken: string; refreshToken: string },
) {
  const secure = process.env.NODE_ENV === 'production';

  response.cookie('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  response.cookie('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

export function clearAuthCookies(response: Response) {
  response.clearCookie('accessToken');
  response.clearCookie('refreshToken');
}
