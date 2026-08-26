package sitemaphttp

import (
	"context"
	"net/url"
	"strings"

	"github.com/dujiao-next/internal/config"
	"github.com/dujiao-next/internal/logger"
	"github.com/dujiao-next/internal/sitecontext"

	"github.com/gin-gonic/gin"
)

// Generator 生成 sitemap.xml / robots.txt。
type Generator interface {
	Generate(ctx context.Context, baseURL string) (string, error)
	GenerateRobots(baseURL string) string
}

type SitemapIndexer interface{ GenerateIndex(baseURL string) string }

// SiteBrandReader 提供后台配置的站点品牌 URL。
type SiteBrandReader interface {
	GetSiteURL() (string, error)
}

// Handler 处理 SEO 静态资源请求。
type Handler struct {
	sitemap Generator
	brand   SiteBrandReader
	sites   sitecontext.Resolver
}

func NewHandler(sitemap Generator, brand SiteBrandReader) *Handler {
	return &Handler{sitemap: sitemap, brand: brand}
}

func NewHandlerWithSite(sitemap Generator, brand SiteBrandReader, site config.SiteConfig) *Handler {
	return &Handler{sitemap: sitemap, brand: brand, sites: sitecontext.NewResolver(site)}
}

// GetSitemapIndex 提供可扩展的 sitemap 索引入口。
func (h *Handler) GetSitemapIndex(c *gin.Context) {
	if h == nil || h.sitemap == nil {
		c.String(503, "sitemap service unavailable")
		return
	}
	baseURL := h.resolveBaseURL(c)
	if indexer, ok := h.sitemap.(SitemapIndexer); ok {
		c.Header("Cache-Control", "public, max-age=300")
		c.Data(200, "application/xml; charset=utf-8", []byte(indexer.GenerateIndex(baseURL)))
		return
	}
	c.Redirect(302, baseURL+"/sitemap.xml")
}

// GetSitemap GET /sitemap.xml
func (h *Handler) GetSitemap(c *gin.Context) {
	if h == nil || h.sitemap == nil {
		c.String(503, "sitemap service unavailable")
		return
	}

	baseURL := h.resolveBaseURL(c)
	xmlStr, err := h.sitemap.Generate(c.Request.Context(), baseURL)
	if err != nil {
		logger.Errorw("sitemap_generate_failed", "error", err)
		c.String(500, "internal error")
		return
	}

	c.Header("Cache-Control", "public, max-age=300")
	c.Data(200, "application/xml; charset=utf-8", []byte(xmlStr))
}

// GetRobots GET /robots.txt
func (h *Handler) GetRobots(c *gin.Context) {
	baseURL := ""
	body := "User-agent: *\nDisallow:\n"
	if h != nil && h.sitemap != nil {
		baseURL = h.resolveBaseURL(c)
		body = h.sitemap.GenerateRobots(baseURL)
	}

	c.Header("Cache-Control", "public, max-age=3600")
	c.Data(200, "text/plain; charset=utf-8", []byte(body))
}

// resolveBaseURL 按当前请求 Host 生成站点 URL，支持同一实例承载多个域名。
func (h *Handler) resolveBaseURL(c *gin.Context) string {
	scheme := "https"
	if c.Request.TLS == nil && c.GetHeader("X-Forwarded-Proto") == "" {
		scheme = "http"
	}
	if proto := c.GetHeader("X-Forwarded-Proto"); proto != "" {
		scheme = proto
	}
	host := c.Request.Host
	if forwardedHost := c.GetHeader("X-Forwarded-Host"); forwardedHost != "" {
		host = forwardedHost
	}
	if h != nil && h.sites.Resolve(host).Origin != "" {
		resolved := h.sites.Resolve(host)
		if configuredHost(host, resolved) {
			return resolved.Origin
		}
	}
	return scheme + "://" + host
}

func configuredHost(raw string, resolved sitecontext.Context) bool {
	host := strings.ToLower(strings.TrimSpace(strings.Split(raw, ":")[0]))
	for _, origin := range []string{resolved.ChinaOrigin, resolved.OverseasOrigin} {
		u, err := url.Parse(origin)
		if err == nil && strings.EqualFold(host, strings.Split(u.Host, ":")[0]) {
			return true
		}
	}
	return false
}
