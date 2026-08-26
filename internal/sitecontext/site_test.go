package sitecontext

import (
	"testing"

	"github.com/dujiao-next/internal/config"
)

func TestResolverUsesDomainDefaults(t *testing.T) {
	r := NewResolver(config.SiteConfig{ChinaURL: "https://cn.example", OverseasURL: "https://example", DefaultURL: "https://example"})
	if got := r.Resolve("cn.example:443"); got.DefaultLocale != "zh-CN" || got.Origin != "https://cn.example" {
		t.Fatalf("unexpected China context: %+v", got)
	}
	if got := r.Resolve("example"); got.DefaultLocale != "en-US" || got.Origin != "https://example" {
		t.Fatalf("unexpected overseas context: %+v", got)
	}
}

func TestResolverDoesNotUseUntrustedHostAsOrigin(t *testing.T) {
	r := NewResolver(config.SiteConfig{ChinaURL: "https://cn.example", OverseasURL: "https://example", DefaultURL: "https://example"})
	if got := r.Resolve("evil.example"); got.Origin != "https://example" {
		t.Fatalf("unexpected origin: %+v", got)
	}
}
