module.exports = {
    isLinkActive: (page, link) => {
        return page == link ? 'active' : '';
    },

    isDisplayable: (type) => {
        const accept = [
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/svg+xml',
            'image/tiff',
            'application/pdf'
        ]
        return accept.findIndex(t => type == t) > -1;
    },
    isPDF: (type) => {
        return type == 'application/pdf' ? 'pdf' : '';
    },
    getIcon: (name) => {
        const icons = [
            'jpg.svg',
            'pdf.svg',
            'png.svg',
            'txt.svg'
        ];
        const icon = `${name.split('.').pop()}.svg`;
        return icons.findIndex(i => icon == i) > -1 ? `/icons/${icon}` : '/icons/unknown.svg';
    },
     startsWith: (str, prefix) => {
      if (typeof str !== 'string' || typeof prefix !== 'string') return false;
      return str.startsWith(prefix);
    },

    includes: (str, substr) => {
      if (typeof str !== 'string' || typeof substr !== 'string') return false;
      return str.indexOf(substr) !== -1;
    },

    or: function () {
      const args = Array.prototype.slice.call(arguments, 0, -1); 
      return args.some(Boolean);
    },

    eq: (a, b) => a === b,

    isTextLike: (contentType) => {
      if (typeof contentType !== 'string') return false;
      const ct = contentType.toLowerCase();
      return ct.startsWith('text/') || ct.includes('json') || ct.includes('csv');
    }
}
