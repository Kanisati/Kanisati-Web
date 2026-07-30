import { createTheme } from '@mantine/core';

export const theme = createTheme({
    fontSizes: {
        xs: '10px',
        sm: '12px',
        md: '14px',
        lg: '16px',
        f18: '18px',
        f20: '20px',
        xllg: '30px',
        xl: '40px',
    },
    colors: {
        red: ['#fff1f1', '#ffe0e0', '#ffc5c5', '#ff9b9b', '#ff6b6b', '#f23f3f', '#db2626', '#b61f1f', '#921f1f', '#781f1f'],
        orange: ['#fff7eb', '#ffedd1', '#ffd8a3', '#ffc06d', '#ffaa36', '#f6951a', '#de7f08', '#b66608', '#8d4f0d', '#6b3d0d'],
        black: ['#f8f9fa', '#eef1f4', '#dde3e8', '#c6d0d8', '#a9b7c1', '#8396a5', '#607688', '#43586b', '#2c3d4e', '#1b2938'],
        green: ['#ecf9ef', '#d8f2df', '#b0e6bf', '#80d799', '#57c87a', '#36b462', '#279b54', '#1f7d45', '#1d633a', '#1b5032'],
        purple: ['#f6efff', '#ebdcff', '#d5b8ff', '#bc8fff', '#a266ff', '#8b42f5', '#752bcc', '#5f23a4', '#4a1f7e', '#391a5f'],
        blue: ['#ebf5fb', '#d7eaf7', '#afd4ef', '#84bce5', '#579fd8', '#2f82c7', '#1f6ea9', '#195987', '#154769', '#12384f']
    },
    radius: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
    },
});
