# Cloud

## Overview

Cocos AI deploys confidential computing workloads across multi-cloud environments using purpose-built Confidential Virtual Machines (CVMs) that provide hardware-level memory encryption and integrity guarantees. The cloud infrastructure implements a defense-in-depth security model combining customer-managed encryption, confidential computing primitives, and runtime integrity monitoring to establish a verifiable trusted execution environment.

## Architecture Components

### Agent Runtime Environment
The Cocos agent operates as the core computational engine within each CVM, providing a secure execution context for collaborative confidential computing algorithms. The agent supports multiple execution runtimes:

- **Docker Containers**: Containerized workloads with hardware-encrypted memory isolation
- **WebAssembly (Wasm) Modules**: Lightweight, sandboxed execution via WasmEdge runtime
- **Python Scripts**: Native Python execution with confidential computing guarantees  
- **ELF Binaries**: Direct native code execution within the trusted environment

### Multi-Cloud Deployment Strategy

#### Microsoft Azure Implementation
Azure deployment leverages Confidential VM SKUs (`Standard_DC*ads_v5`) with VMGuestStateOnly encryption and customer-managed disk encryption sets (DES) supported by SEV-SNP (Secure Encrypted Virtualization with Secure Nested Paging) for memory encryption and integrity protection.

**Key Vault Configuration**:
```hcl
resource "azurerm_key_vault" "encryption_vault" {
  sku_name                   = "premium"          # FIPS 140-2 Level 2 HSMs
  purge_protection_enabled   = true               # Prevents key destruction
  soft_delete_retention_days = 7                  # Recovery window
}
```

**Confidential VM Specification**:
```hcl
resource "azurerm_linux_virtual_machine" "confidential" {
  size = "Standard_DC${var.vcpu}ads_v5"           # Confidential compute SKU
  
  os_disk {
    security_encryption_type = "VMGuestStateOnly"  # Guest state encryption
    disk_encryption_set_id   = var.disk_encryption_id
  }
  
  vtpm_enabled        = true                      # Virtual TPM for attestation
  secure_boot_enabled = true                      # Verified boot chain
}
```

#### Google Cloud Platform Implementation
GCP deployment utilizes AMD Milan-based N2D instances with SEV-SNP (Secure Encrypted Virtualization with Secure Nested Paging) for memory encryption and integrity protection.

**Confidential Computing Configuration**:
```hcl
resource "google_compute_instance" "confidential" {
  machine_type     = "n2d-standard-${var.vcpu}"
  min_cpu_platform = "AMD Milan"                  # SEV-SNP requirement
  
  confidential_instance_config {
    enable_confidential_compute = true
    confidential_instance_type  = "SEV_SNP"       # Hardware memory encryption
  }
  
  shielded_instance_config {
    enable_integrity_monitoring = true            # Boot integrity verification
    enable_secure_boot          = true            # Verified boot process
    enable_vtpm                 = true            # Virtual TPM
  }
  
  scheduling {
    on_host_maintenance = "TERMINATE"             # Prevents live migration
  }
}
```

## Security Architecture

### Memory Protection Mechanisms

**Azure VMGuestStateOnly Encryption**: Encrypts VM guest state including memory, CPU state, and temporary storage while maintaining host visibility for management operations.

**GCP SEV-SNP Protection**: Provides comprehensive memory encryption with integrity guarantees, protecting against both passive memory snooping and active memory corruption attacks from the hypervisor layer.

### Customer-Managed Key Infrastructure

Both platforms implement customer-controlled encryption keys with hardware security module (HSM) backing:

**Azure Key Vault Premium**: FIPS 140-2 Level 2 validated HSMs with comprehensive key lifecycle management and access policies restricted to cryptographic operations (decrypt, encrypt, wrapKey, unwrapKey).

**GCP Cloud KMS**: Customer-managed encryption keys (CMEK) with automated 90-day rotation policies and global key distribution for multi-region deployments.

### Integrity Measurement Architecture

The deployment integrates Linux Integrity Measurement Architecture (IMA) with hardware-based attestation:

```bash
# IMA Policy Configuration
ima_policy=tcb    # Trusted Computing Base measurement
```

**IMA Implementation Details**:
- **Boot-time Measurement**: All critical system components are measured during boot sequence
- **Runtime Monitoring**: Continuous measurement of executed files and loaded libraries
- **Attestation Support**: Generates cryptographic proofs of system integrity state
- **Cache Optimization**: Pre-measurement of frequently accessed files to minimize runtime overhead

## Agent Provisioning Pipeline

### Cloud-Init Orchestration
The agent deployment utilizes a multi-stage Cloud-Init configuration that implements security hardening alongside functional provisioning.

**Stage 1: Base System Hardening**
```yaml
# Disable remote access vectors
- systemctl disable ssh.service sshd.service
- systemctl stop ssh.service sshd.service

# Network interface validation (single interface enforcement)
if [ $NUM_OF_IFACE -gt $NUM_OF_PERMITED_IFACE ]; then
    exit 1  # Fail deployment on multiple interfaces
fi
```

**Stage 2: Runtime Environment Setup**
```yaml
# WasmEdge Runtime Installation
curl -sSf https://raw.githubusercontent.com/WasmEdge/WasmEdge/master/utils/install.sh | bash -s -- -v 0.13.5

# Docker Configuration with Ramdisk
Environment=DOCKER_RAMDISK=true  # Ephemeral container storage
```

**Stage 3: Agent Service Configuration**
```yaml
[Service]
Type=simple
User=root
WorkingDirectory=/cocos
EnvironmentFile=/etc/cocos/environment
ExecStartPre=/cocos_init/agent_setup.sh
ExecStart=/cocos_init/agent_start_script.sh
Restart=always
StartLimitInterval=300
StartLimitBurst=5
```

### Certificate and Credential Management
Agent authentication utilizes mutual TLS with certificate-based authentication for communication with the cloud:

```yaml
write_files:
  - path: /etc/cocos/certs/cert.pem
    permissions: "0644"
  - path: /etc/cocos/certs/key.pem  
    permissions: "0600"              # Restricted key access
  - path: /etc/cocos/certs/ca.pem
    permissions: "0644"
```

## Network Security Configuration

### Firewall and Access Control
Network access is restricted to essential agent communication channels:

**GCP Firewall Rule**:
```hcl
resource "google_compute_firewall" "allow-agent" {
  name = "allow-agent-${var.vm_name}"
  
  allow {
    protocol = "tcp"
    ports    = ["7002"]              # Agent GRPC endpoint only
  }
  
  source_ranges = ["0.0.0.0/0"]     # Consider IP restriction for production
  target_tags   = [var.vm_name]
}
```

### Interface Validation and Host Discovery
The agent startup script enforces network topology constraints:

```bash
# Single interface enforcement
NUM_OF_IFACE=$(ip route | grep -Eo 'dev [a-z0-9]+' | awk '{ print $2 }' | 
               grep -v '^docker' | sort | uniq | wc -l)

# Dynamic host configuration
DEFAULT_IFACE=$(route | grep '^default' | grep -o '[^ ]*$')
AGENT_GRPC_HOST=$(ip -4 addr show $DEFAULT_IFACE | grep inet | 
                  awk '{print $2}' | cut -d/ -f1)
```

## Operational Resilience

### Service Recovery and State Management
The agent implements automatic recovery mechanisms with state preservation:

- **Automatic Restart**: `Restart=always` with exponential backoff (10s base, 5 burst attempts)
- **Post-Reboot Recovery**: Dedicated service handles IMA cache warming and service restoration
- **Docker Daemon Management**: Ramdisk configuration with dependency-aware startup sequencing

### Monitoring and Observability
Comprehensive logging infrastructure captures system and agent state:

```bash
StandardOutput=file:/var/log/cocos/agent.stdout
StandardError=file:/var/log/cocos/agent.stderr
```

**Log Categories**:
- **Setup Logs**: `/var/log/cocos/setup.log` - Initial provisioning status
- **IMA Logs**: `/var/log/cocos/ima_setup.log` - Integrity measurement configuration
- **Agent Logs**: `/var/log/cocos/agent.log` - Runtime operation and GRPC communication
- **Verification Logs**: `/var/log/cocos/verification.log` - Component validation results

## Performance Optimizations

### Memory and Storage Efficiency
- **Docker Ramdisk**: Eliminates persistent container storage overhead and forensic artifacts
- **IMA Cache Warming**: Pre-measurement of system files reduces runtime measurement latency
- **Filesystem Expansion**: Automatic root partition resizing maximizes available compute storage

### Boot Sequence Optimization
- **Conditional Reboot Logic**: IMA policy activation triggers single reboot when required
- **Dependency Management**: Service ordering ensures network and Docker availability before agent startup
- **Resource Validation**: Pre-flight checks prevent failed deployments due to missing dependencies

This cloud configuration establishes a hardened, verifiable execution environment for Cocos AI's confidential computing workloads, combining hardware-level security primitives with comprehensive software-based integrity monitoring and access controls.
