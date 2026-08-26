package sitecontext

import (
	"net"
	"net/url"
	"strings"

	"github.com/dujiao-next/internal/config"
)

type Context struct {
	Origin         string
	DefaultLocale  string
	ChinaOrigin    string
	OverseasOrigin string
}

type Resolver struct{ cfg config.SiteConfig }

func NewResolver(cfg config.SiteConfig) Resolver { return Resolver{cfg: cfg} }

func (r Resolver) Resolve(rawHost string) Context {
	china := normalizeOrigin(r.cfg.ChinaURL, "https://cn.huangwenxuangod.xyz")
	overseas := normalizeOrigin(r.cfg.OverseasURL, "https://huangwenxuangod.xyz")
	defaultOrigin := normalizeOrigin(r.cfg.DefaultURL, overseas)
	host := normalizeHost(rawHost)
	if host == hostOf(china) || host == "cn.huangwenxuangod.xyz" {
		return Context{Origin: china, DefaultLocale: "zh-CN", ChinaOrigin: china, OverseasOrigin: overseas}
	}
	if host == hostOf(overseas) || host == "huangwenxuangod.xyz" || host == "www.huangwenxuangod.xyz" {
		return Context{Origin: overseas, DefaultLocale: "en-US", ChinaOrigin: china, OverseasOrigin: overseas}
	}
	return Context{Origin: defaultOrigin, DefaultLocale: "en-US", ChinaOrigin: china, OverseasOrigin: overseas}
}

func normalizeOrigin(raw, fallback string) string {
	raw = strings.TrimRight(strings.TrimSpace(raw), "/")
	if u, err := url.Parse(raw); err == nil && (u.Scheme == "http" || u.Scheme == "https") && u.Host != "" {
		return raw
	}
	return fallback
}

func normalizeHost(raw string) string {
	raw = strings.TrimSpace(strings.Split(raw, ",")[0])
	if host, _, err := net.SplitHostPort(raw); err == nil {
		return strings.ToLower(host)
	}
	return strings.ToLower(strings.TrimSuffix(raw, "."))
}

func hostOf(origin string) string {
	u, err := url.Parse(origin)
	if err != nil {
		return ""
	}
	return normalizeHost(u.Host)
}
